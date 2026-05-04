import Set from "../models/set.js";

// helper to create slug
const makeSlug = (name) => `set-${name.toLowerCase().replace(/\s+/g, "-")}`;

// CREATE SET
export const createSet = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name)
      return res.status(400).json({ message: "Set name is required" });

    const exists = await Set.findOne({ name });
    if (exists)
      return res.status(400).json({ message: "Set already exists" });

    const set = await Set.create({
      name,
      slug: makeSlug(name)
    });

    res.status(201).json(set);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET ALL SETS
export const getSets = async (req, res) => {
  try {
    const sets = await Set.find().sort({ name: 1 });
    res.json(sets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET SINGLE SET
export const getSet = async (req, res) => {
  try {
    const set = await Set.findById(req.params.id);

    if (!set)
      return res.status(404).json({ message: "Set not found" });

    res.json(set);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE SET
export const updateSet = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name)
      return res.status(400).json({ message: "Set name is required" });

    const set = await Set.findByIdAndUpdate(
      req.params.id,
      {
        name,
        slug: makeSlug(name)
      },
      { returnDocument: 'after', runValidators: true } 
    );

    if (!set)
      return res.status(404).json({ message: "Set not found" });

    res.json(set);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE SET
export const deleteSet = async (req, res) => {
  try {
    const set = await Set.findByIdAndDelete(req.params.id);

    if (!set)
      return res.status(404).json({ message: "Set not found" });

    res.json({ message: "Set deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};