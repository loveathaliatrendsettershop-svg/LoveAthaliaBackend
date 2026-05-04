import Size from "../models/size.js";

// helper to create slug
const makeSlug = (num) => `size-${num}`;

export const createSize = async (req, res) => {
  try {
    const { name } = req.body;

    const slug = makeSlug(name);

    const exists = await Size.findOne({ name });
    if (exists) {
      return res.status(400).json({ message: "Size already exists" });
    }

    const size = await Size.create({ name, slug });
    res.status(201).json(size);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getSizes = async (req, res) => {
  const sizes = await Size.find().sort({ name: 1 });
  res.json(sizes);
};

export const updateSize = async (req, res) => {
  const { name } = req.body;

  const size = await Size.findByIdAndUpdate(
    req.params.id,
    { name, slug: makeSlug(name) },
    { new: true }
  );

  res.json(size);
};

export const deleteSize = async (req, res) => {
  await Size.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
};