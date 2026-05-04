import mongoose from "mongoose";

export const connectDb = async () => {
    try {
        mongoose.connect(process.env.MONGODB_URI);
        console.log("MONGODB CONNECTED SUCCESSFULLY");
    } catch(error) {
        console.log(error);
        process.exit(1);
    }
};