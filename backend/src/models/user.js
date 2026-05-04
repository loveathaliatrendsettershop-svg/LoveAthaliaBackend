import mongoose from "mongoose";


//may controller na
const userSchema = new mongoose.Schema({
  image:{
    type:String,
    default: ""
  },
  last_name: {
    type: String,
    required: true
  },
  first_name: {
    type: String,
    required: true
  },
  email:{
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ["admin", "cashier"],
    default: "cashier"
  },

    // hindi pa connected sa logreport need i connect gamit function
    lastActive: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

export default User;