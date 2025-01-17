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
    const isValidPassword = await bcryptjs.compare(password,user.password,);
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
      .json({ message: "User Logged in successfully", token,user });
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

export const resetEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const findUser = await User.findOne({ email });
    if (!findUser) {
      return res.status(400).json({ message: "User not found" });
    }
    
    const token = jwt.sign({ userId: findUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    console.log("Token during signing:", token); 
    
    findUser.resetToken = token;
    findUser.resetTokenExpiration = Date.now() + 3600000;
    await findUser.save();

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
      to: findUser.email,
      from: process.env.EMAIL_USERNAME,
      subject: "Password Reset",
      html: `<div style="width: 90%; height: fitcontent;border: 2px solid #021742;border-radius: 20px;">
    <div style="width: 60%; max-width: 600px; margin: auto;border-bottom: 1px solid;">

    </div>
    <div style="width: 80%; max-width: 600px; margin: auto; text-align: left; font-family: Arial, sans-serif;">
      <p style="font-size: 16px;">Dear ${email},</p>
      <p style="font-size: 16px;">We received a request to reset your password. To proceed, please click the link below:<br><br><a href="${
        process.env.FRONT_END_URL
      }/reset-password?token=${token}">Reset Your Password</a>.</p>
      <p>For security reasons, this link will expire in [${new Date(
        findUser.resetTokenExpiration
      ).toISOString()}]. If you did not request a password reset, please ignore this email or contact our support team. </p>

      <p>Thank you,</p>

    </div>
  </div> `,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err)
        return res.status(500).json({
          status: "fail",
          message: err.error,
        });
    });
    res.status(200).json({
      status: "success",
      token,
      message: "Reset email sent",
    });
  } catch (error) {
    return res.status(500).json({ status: "error", message: error.message });
  }
};
export const resetPassword = async (req, res) => {
  const  token  = req.params.token;
  const { password } = req.body;

  try {
    console.log("Token during verify:", token); 

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({
      _id: decodedToken.userId,
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() },
    });

    if (!user) {
      console.log("Invalid or expired token");
      return res.status(400).send("Invalid or expired token");
    }

    const hashedPassword = await bcryptjs.hash(password, 10);
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.log("Error verifying token:", error.message);
    return res.status(400).send({ message: "Invalid or expired token" });
  }
};
