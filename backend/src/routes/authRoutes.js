import express from "express";
import { loginUser, logoutUser } from "../controller/logController.js";

const authRoute = express.Router();

// Time In
authRoute.post("/login", loginUser);

// Time Out
authRoute.post("/logout", logoutUser);

export default authRoute;