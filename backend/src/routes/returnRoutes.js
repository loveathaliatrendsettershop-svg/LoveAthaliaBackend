import express from "express";
import {
  getReturns,
  createReturn,
  updateReturnStatus,
} from "../controller/returnController.js";

const router = express.Router();

// Get all returns
router.get("/", getReturns);

// Create new return
router.post("/", createReturn);

// Update return status (handles stock automatically)
router.patch("/:id/status", updateReturnStatus);

export default router;