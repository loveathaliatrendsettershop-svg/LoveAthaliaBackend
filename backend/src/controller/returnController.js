import Return from "../models/return.js";
import Product from "../models/product.js";

// ✅ Get all returns
export const getReturns = async (req, res) => {
  try {
    const returns = await Return.find()
      .populate("returnItems.product")
      .populate("returnItems.replacementProduct")
      .sort({ createdAt: -1 });
    res.status(200).json(returns);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Create return request
export const createReturn = async (req, res) => {
  try {
    const { orderId, customer, returnType, returnItems } = req.body;

    if (!orderId)
      return res.status(400).json({ message: "Order ID is required" });
    if (!customer)
      return res.status(400).json({ message: "Customer name is required" });
    if (!returnType)
      return res.status(400).json({ message: "Return type is required" });
    if (!Array.isArray(returnItems) || returnItems.length === 0)
      return res.status(400).json({ message: "Return items are required" });

    // ✅ Validate replacement products for exchange type
if (returnType === 'exchange') {
  for (const item of returnItems) {
    if (!item.replacementProduct)
      return res.status(400).json({ message: 'Replacement product required for exchange' });

    const replacement = await Product.findById(item.replacementProduct);
    if (!replacement)
      return res.status(400).json({ message: 'Replacement product not found' });
    if (replacement.stock < item.replacementQuantity)
      return res.status(400).json({ message: `${replacement.name} does not have enough stock` });
  }
}

    const returnDoc = await Return.create({
      orderId,
      customer,
      returnType,
      returnItems,
      status: "Returning",
    });

    res.status(201).json(returnDoc);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Update return status + handle stock
export const updateReturnStatus = async (req, res) => {
  try {
    const {
      status,
      trackingNo,
      courier,
      shippedDate,
      receivedDate,
      condition,
      notes,
      action,
      exchangeItems,
    } = req.body;

    const returnDoc = await Return.findById(req.params.id);
    if (!returnDoc) return res.status(404).json({ message: "Return not found" });

    // Save extra fields
    if (trackingNo)   returnDoc.trackingNo   = trackingNo;
    if (courier)      returnDoc.courier      = courier;
    if (shippedDate)  returnDoc.shippedDate  = shippedDate;
    if (receivedDate) returnDoc.receivedDate = receivedDate;
    if (condition)    returnDoc.condition    = condition;
    if (notes)        returnDoc.notes        = notes;
    if (action)       returnDoc.action       = action;

    // ── Exchanged: save replacement info + deduct replacement stock ──
    if (status === "Exchanged" && action === "exchange" && Array.isArray(exchangeItems)) {
      for (let idx = 0; idx < exchangeItems.length; idx++) {
        const exItem = exchangeItems[idx];
        if (!exItem || !exItem.product) continue;

        const replacement = await Product.findById(exItem.product);
        if (!replacement)
          return res.status(404).json({ message: "Replacement product not found" });
        if (replacement.stock < exItem.quantity)
          return res.status(400).json({ message: `${replacement.name} does not have enough stock` });

        // ✅ Match by index — returnItems[idx] gets the replacement info
        if (returnDoc.returnItems[idx]) {
          returnDoc.returnItems[idx].replacementProduct  = replacement._id;
          returnDoc.returnItems[idx].replacementName     = replacement.name;
          returnDoc.returnItems[idx].replacementPrice    = replacement.wholesalePrice ?? replacement.retailPrice ?? 0;
          returnDoc.returnItems[idx].replacementQuantity = exItem.quantity;
        }

        // Deduct replacement stock
        replacement.stock -= exItem.quantity;
        await replacement.save();
      }

      returnDoc.markModified("returnItems");
    }

    // ── Reshipped: handle reship of same item (net zero stock) ──
    if (status === "Reshipped" && action === "reship") {
      for (const item of returnDoc.returnItems) {
        const product = await Product.findById(
          item.product?._id ?? item.product
        );
        if (product && product.stock < item.returnQuantity)
          return res.status(400).json({ message: `${product.name} does not have enough stock to reship` });
      }
    }

    // ── Return: restore stock when item physically received back ──
    if (status === "Return") {
      for (const item of returnDoc.returnItems) {
        const product = await Product.findById(
          item.product?._id ?? item.product
        );
        if (product) {
          product.stock += item.returnQuantity;
          await product.save();
        }
      }
    }

    returnDoc.status = status;
    await returnDoc.save();

    // ✅ Return the populated doc so frontend gets updated replacement data
    const populated = await Return.findById(returnDoc._id)
      .populate("returnItems.product")
      .populate("returnItems.replacementProduct");

    res.status(200).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};