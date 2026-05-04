import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    nameTobill: {
      type: String,
      required: true,
    },

    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: String,   // snapshot
        price: Number,  // snapshot
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],

    subTotal: {
      type: Number,
      required: true,
    },

    paymentMethod: {
      type: String,
      required: true,
      enum: ["cash", "gcash", "card"],
    },

    paymentReference: {
      type: String,
      default: null,
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid"],
      default: "Pending",
    },

    status: {
      type: String,
     enum: [
    "Reserved", "Overdue", "To Ship", "Shipped Out",
    "Completed", "Cancelled", "Returning", "Exchanged", "Reshipped", "Return"
  ],
        default: "Reserved",
    },
    shipmentMethod: { type: String, default: null },
    courier:        { type: String, default: null },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;