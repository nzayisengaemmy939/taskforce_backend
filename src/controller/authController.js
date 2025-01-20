import User from "../models/auth.js";
import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import nodemailer from "nodemailer";
export const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    const existingUser = await User.findOne({ email });

    if (!password || !email || !lastName || !firstName) {
      return res.status(404).json({
        message: "All fields are required",
      });
    }
    if (existingUser) {
      return res.status(409).json({ message: "User already exist" });
    }
    const hashedPassword = await bcryptjs.hash(password, 10);
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });
    return res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: "error",
      message: "Server error",
    });
  }
};
export const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "Account does not exist" });
    }
    const isValidPassword = await bcryptjs.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: "Incorrect password" });
    }
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    return res
      .status(200)
      .json({ message: "User Logged in successfully", token, user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: "error",
      message: "Server error",
    });
  }
};

export const getUser = async (req, res) => {
  try {
    const singleUser = await User.findOne({ _id: req.params.id });
    if (!singleUser) {
      return res.status(400).json({
        status: "Fail",
        message: "user with that Id does not exist!",
      });
    }
    return res.status(200).json({
      status: "success",
      message: "Single user",
      data: singleUser,
    });
  } catch (error) {
    return res.status(500).json({
      status: "Fail",
      message: error.message,
    });
  }
};
export const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, email } = req.body;
    const userFound = await User.findOne({ _id: req.params.id });
    if (!userFound) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }
    if (firstName) {
      userFound.firstName = firstName;
    }
    if (lastName) {
      userFound.lastName = lastName;
    }
    if (email) {
      userFound.email = email;
    }
    userFound.updatedAt = new Date();
    await userFound.save();
    return res.status(200).json({
      status: "success",
      message: "User updated successfully",
      data: userFound,
    });
  } catch (error) {
    return res.status(500).json({
      status: "internal server error",
      error: error.message,
    });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userFound = await User.findOne({ _id: req.params.id });
    console.log(userFound.email, "userfound email");

    const isValidPassword = await bcryptjs.compare(
      oldPassword,
      userFound.password
    );

    console.log(isValidPassword);
    if (!isValidPassword) {
      return res.status(400).json({
        message: "old password is not correct",
      });
    }
    userFound.password = newPassword;
    await userFound.save();
    return res.status(200).json({
      data: userFound.password,
      message: "Password Updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

const createPasswordResetEmail = (email, token, expirationDate) => {
  return `
    <div style="width: 90%; max-width: 600px; margin: auto; border: 2px solid #007BFF; border-radius: 20px; overflow: hidden; font-family: Arial, sans-serif; background-color: #f9f9f9;">
      <div style="width: 100%; background-color: #007BFF; padding: 15px; text-align: center;">
        <h2 style="color: #ffffff; margin: 0;">Password Reset Request</h2>
      </div>
      <div style="padding: 20px; color: #333333;">
        <p style="font-size: 16px; color: #007BFF;">Dear ${email}</p>
        <p style="font-size: 16px; line-height: 1.5;">
          We received a request to reset your password. To proceed, please click the button below:<br><br>
          <a href="${process.env.FRONT_END_URL}/reset?token=${token}" 
             style="background-color: #007BFF; 
                    color: #ffffff; 
                    padding: 10px 20px; 
                    text-decoration: none; 
                    border-radius: 5px; 
                    display: inline-block;">
            Reset Your Password
          </a>
        </p>
        <p style="font-size: 14px; line-height: 1.5; color: #555555;">
          For security reasons, this link will expire on 
          <strong style="color: #007BFF;">${new Date(
            expirationDate
          ).toLocaleString()}</strong>. 
          If you did not request a password reset, please ignore this email or contact our support team.
        </p>
        <p style="font-size: 14px; color: #555555;">Thank you,</p>
        <p style="font-size: 14px; color: #007BFF; font-weight: bold;">The Support Team</p>
      </div>
      <div style="background-color: #e0e0e0; padding: 10px; text-align: center;">
        <p style="font-size: 12px; color: #555555; margin: 0;">
          © ${new Date().getFullYear()} NZAYISENGA EMMANUEL. All rights reserved.
        </p>
      </div>
    </div>
  `;
};

const sendEmail = async (to, subject, html) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const mailOptions = {
    to,
    from: process.env.EMAIL_USERNAME,
    subject,
    html,
  };

  return await transporter.sendMail(mailOptions);
};


export const resetEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: "fail",
        message: "Email is required",
      });
    }

    const findUser = await User.findOne({ email });
    if (!findUser) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    const token = jwt.sign({ userId: findUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    const expirationDate = Date.now() + 3600000; 
    findUser.resetToken = token;
    findUser.resetTokenExpiration = expirationDate;
    await findUser.save();

    const emailHtml = createPasswordResetEmail(email, token, expirationDate);

    await sendEmail(findUser.email, "Password Reset", emailHtml);

    res.status(200).json({
      status: "success",
      message: "Reset email sent successfully",
    });
  } catch (error) {
    console.error("Password reset error:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to process password reset request",
    });
  }
};
export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });

    const user = await User.findOne({
      _id: decodedToken.userId,
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() },
    });

    if (!user) {
      console.log("No user found with token");
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;

    await user.save();

    return res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(400).json({ message: "Token has expired" });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(400).json({ message: "Invalid token" });
    }

    return res.status(500).json({ message: "Error resetting password" });
  }
};
