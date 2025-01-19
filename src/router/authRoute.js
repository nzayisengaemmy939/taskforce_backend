import { getUser } from "../controller/authController.js";
import { updatePassword } from "../controller/authController.js";
import { resetPassword } from "../controller/authController.js";
import { resetEmail } from "../controller/authController.js";
import { updateProfile } from "../controller/authController.js";
import { registerUser,userLogin } from "../controller/authController.js";
import express from 'express'


 export const userRoute = express.Router();
userRoute.post('/auth/register',registerUser)
userRoute.post('/auth/login',userLogin)
userRoute.get('/auth/get/profile/:id', getUser);
userRoute.put("/auth/update/profile/:id", updateProfile);
userRoute.put("/auth/update/password/:id", updatePassword);
userRoute.post("/auth/send/email", resetEmail);
userRoute.post("/auth/reset/password/:token",resetPassword);

