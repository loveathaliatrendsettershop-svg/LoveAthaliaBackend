import express from "express";
import {
  getOrders,
  createOrder,
  submitPaymentReference,
  updateOrderStatus,
  deleteOrder,
  updateShipmentDetails
} from "../controller/orderControllers.js";

const router = express.Router();

// Get all orders
router.get("/", getOrders);

// Create new order
router.post("/", createOrder);

// Submit payment reference (gcash/card)
router.patch("/:id/payment", submitPaymentReference);

// Update order status (admin only)
router.patch("/:id/status", updateOrderStatus);

router.patch('/:id/shipment', updateShipmentDetails);

// Delete order
router.delete("/:id", deleteOrder);

export default router;