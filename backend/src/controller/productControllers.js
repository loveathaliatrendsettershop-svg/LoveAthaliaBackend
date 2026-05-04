import Product from "../models/product.js";

// ==========================
// GET ALL PRODUCTS
// ==========================
// ✅ Get all products (active only by default)
export const getProducts = async (req, res) => {
  try {
    const showAll = req.query.showAll === 'true';
    const filter  = showAll ? {} : { isActive: true };
    const products = await Product.find(filter)
    .populate('size', 'name')
    .populate('set', 'name')
    .sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================
// CREATE PRODUCT
// ==========================
export const createProduct = async (req, res) => {
  try {
    const {
      images,
      productCode,
      name,
      productDescription,
      size,
      set,
      slot,
      quantityPerPack,
      wholesalePrice,
      retailPrice,
      category,
      stock
    } = req.body;

    const product = await Product.create({
      images,
      productCode,
      name,
      productDescription,
      size,
      set,
      slot,
      quantityPerPack,
      wholesalePrice,
      retailPrice,
      category,
      stock
    });

    // populate size and set before sending response
    await product.populate([
  { path: "size", select: "name slug" },
  { path: "set", select: "name slug" }
]);

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================
// UPDATE PRODUCT
// ==========================
export const updateProduct = async (req, res) => {
  try {
    const {
      images,
      name,
      productDescription,
      size,
      set,
      slot,
      quantityPerPack,
      wholesalePrice,
      retailPrice,
      category,
      stock
    } = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        images,
        name,
        productDescription,
        size,
        set,
        slot,
        quantityPerPack,
        wholesalePrice,
        retailPrice,
        category,
        stock
      },
      { new: true, runValidators: true }
    )
      .populate("size", "name slug")
      .populate("set", "name slug");

    if (!updatedProduct)
      return res.status(404).json({ message: "Product not found" });

    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET TOP 3 BEST SELLERS
export const getBestSellers = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true })
      .populate("size", "name")
      .populate("set", "name")
      .sort({ totalSold: -1 })
      .limit(3);

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// ==========================
// DELETE PRODUCT
// ==========================
// ✅ Toggle product active/inactive (replaces delete)
export const toggleProductStatus = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    product.isActive = !product.isActive;
    await product.save();

    res.json({ message: `Product marked as ${product.isActive ? 'active' : 'inactive'}`, product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};