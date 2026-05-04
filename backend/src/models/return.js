import mongoose from "mongoose";

const returnSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    customer: {
      type: String,
      required: true,
    },
    returnType: {
      type: String,
      enum: ["return", "exchange"],
      required: true,
    },
    returnItems: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: String,
        price: Number,
        returnQuantity: {
          type: Number,
          required: true,
          min: 1,
        },
        reason: String,
        replacementProduct: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          default: null,
        },
        replacementName: {
          type: String,
          default: null,
        },
        replacementPrice: {
          type: Number,
          default: null,
        },
        replacementQuantity: {
          type: Number,
          default: null,
        },
      },
    ],
    trackingNo: {
  type: String,
  default: null,
},
courier: {
  type: String,
  default: null,
},
shippedDate: {
  type: String,
  default: null,
},
receivedDate: {
  type: String,
  default: null,
},
condition: {
  type: String,
  default: null,
},
notes: {
  type: String,
  default: null,
},
action: {
  type: String,
  enum: ['reship', 'exchange', null],
  default: null,
},
// AFTER
status: {
  type: String,
  enum: ["Returning", "Exchanged", "Reshipped", "Return", "Cancelled"],
  default: "Returning",
},
  },
  { timestamps: true }
);

const Return = mongoose.model("Return", returnSchema);
export default Return;