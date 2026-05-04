import express from "express";
import { sendPin, verifyPin, resetPassword } from "../controller/forgotController.js";

const forgotRoute = express.Router();

forgotRoute.post("/send-pin", sendPin);
forgotRoute.post("/verify-pin", verifyPin);
forgotRoute.post("/reset-password", resetPassword);

export default forgotRoute;