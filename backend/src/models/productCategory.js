import mongoose from "mongoose";

const productCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true
    },

    //auto generetated dapat ng backend
    slug: {
      type: String,
      required: true,
      unique: true
    }
  },
  { timestamps: true }
);

const productCategory = mongoose.model("Category", productCategorySchema);

export default productCategory;