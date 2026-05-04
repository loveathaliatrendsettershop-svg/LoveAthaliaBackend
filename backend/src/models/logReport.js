import mongoose from "mongoose";

//wala pang controller
const userLogSchema = new mongoose.Schema({
    // lahat ng ibang info kukuinin na sa user model
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    //need mag create ng function for both timein/timeout
    timeIn:{
        type: Date,
        required: true
    },
    timeOut:{
        type: Date
    }
},{ timestamps: true});

const UserLog = mongoose.model("UserLog", userLogSchema);

export default UserLog;