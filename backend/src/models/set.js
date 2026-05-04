import mongoose from "mongoose";

const setSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true
    },
    slug: {
      type: String,
      required: true,
      unique: true
    }
  },
  { timestamps: true }
);

const SetList = mongoose.model("SetList", setSchema);

export default SetList;