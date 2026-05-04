import express from "express";
import {
  createSet,
  getSets,
  getSet,
  updateSet,
  deleteSet
} from "../controller/setController.js";

const router = express.Router();

router.post("/", createSet);
router.get("/", getSets);
router.get("/:id", getSet);
router.put("/:id", updateSet);
router.delete("/:id", deleteSet);

export default router;