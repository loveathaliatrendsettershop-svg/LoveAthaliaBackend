// controllers/order.js
import Order from "../models/order.js";
import Product from "../models/product.js";

// GET ALL ORDERS
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("products.product").sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE ORDER
export const createOrder = async (req, res) => {
  try {
    const { nameTobill, products, paymentMethod } = req.body;

    if (!nameTobill)
      return res.status(400).json({ message: "Customer name is required" });

    if (!Array.isArray(products) || products.length === 0)
      return res.status(400).json({ message: "Products required" });

    if (!["cash", "gcash", "card"].includes(paymentMethod))
      return res.status(400).json({ message: "Invalid payment method" });

    let subTotal = 0;
    let orderItems = [];

    for (const item of products) {
      const product = await Product.findById(item.product);

      if (!product)
        return res.status(400).json({ message: "Product not found" });

      if (product.stock < item.quantity)
        return res.status(400).json({ message: `${product.name} not enough stock` });

      const price = product.wholesalePrice;
      subTotal += price * item.quantity;

      orderItems.push({
        product: product._id,
        name: product.name,
        price,
        quantity: item.quantity,
      });
    }

    const paymentStatus = paymentMethod === "cash" ? "Paid" : "Pending";
    const status = paymentMethod === "cash" ? "To Ship" : "Reserved";

    const order = await Order.create({
      nameTobill,
      products: orderItems,
      subTotal,
      paymentMethod,
      paymentStatus,
      status,
    });

    // ⭐ IF CASH — deduct stock AND add to totalSold
    if (paymentMethod === "cash") {
      for (const item of order.products) {
        const product = await Product.findById(item.product);

        product.stock -= item.quantity;
        product.totalSold += item.quantity; // ⭐⭐⭐ HERE
        await product.save();
      }
    }

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// SUBMIT PAYMENT (GCash/Card)
export const submitPaymentReference = async (req, res) => {
  try {
    const { reference } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.paymentMethod === "cash")
      return res.status(400).json({ message: "Cash orders do not need reference" });

    if (order.paymentStatus === "Paid")
      return res.status(400).json({ message: "Already paid" });

    for (const item of order.products) {
      const product = await Product.findById(item.product);

      if (product.stock < item.quantity)
        return res.status(400).json({ message: `${product.name} out of stock now` });

      product.stock -= item.quantity;
      product.totalSold += item.quantity; // ⭐⭐⭐ HERE
      await product.save();
    }

    order.paymentReference = reference;
    order.paymentStatus = "Paid";
    order.status = "To Ship";

    await order.save();

    res.json({ message: "Payment reference submitted", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE ORDER STATUS
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;
    await order.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateShipmentDetails = async (req, res) => {
  try {
    const { shipmentMethod, courier } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (shipmentMethod !== undefined) order.shipmentMethod = shipmentMethod;
    if (courier !== undefined)        order.courier        = courier;
    await order.save();
    res.json(order);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// DELETE ORDER (restore stock AND totalSold if paid)
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order)
      return res.status(404).json({ message: "Order not found" });

    if (order.paymentStatus === "Paid") {
      for (const item of order.products) {
        const product = await Product.findById(item.product);
        if (product) {
          product.stock += item.quantity;
          product.totalSold -= item.quantity; // ⭐⭐⭐ VERY IMPORTANT
          await product.save();
        }
      }
    }

    await order.deleteOne();

    res.json({ message: "Order deleted and stock restored if needed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};