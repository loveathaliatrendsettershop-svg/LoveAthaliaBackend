import express from "express";
import { getAllLogs, getLogsByUser, getLogsByDate, checkUserStatus } from "../controller/logController.js";

const logsRoute = express.Router();

// All logs
logsRoute.get("/", getAllLogs);

// Logs by user
logsRoute.get("/user/:userId", getLogsByUser);

// Logs by date range
logsRoute.get("/date", getLogsByDate);

// Check if user is currently active
logsRoute.get("/status/:userId", checkUserStatus);

export default logsRoute;