// models/product.js
import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  images: [{ type: String }],

  productCode: {
    type: String,
    required: true,
    unique: true
  },

  name: {
    type: String,
    required: true
  },

  productDescription: {
    type: String,
    required: true
  },

  size: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Size",
      required: true
    }
  ],

  set: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SetList",
      required: true
    }
  ],

  slot: Number,

  quantityPerPack: {
    type: Number,
    required: true
  },

  wholesalePrice: {
    type: Number,
    required: true
  },

  retailPrice: {
    type: Number,
    required: true
  },

  category: {
    type: String,
    required: true
  },

  isActive: {
    type: Boolean,
    default: true,
  },

  stock: {
    type: Number,
    required: true
  },

  // ⭐⭐⭐ ADD THIS (for Best Seller)
  totalSold: {
    type: Number,
    default: 0
  }

}, { timestamps: true });

productSchema.index({ name: 1 });
productSchema.index({ category: 1 });

export default mongoose.model("Product", productSchema);