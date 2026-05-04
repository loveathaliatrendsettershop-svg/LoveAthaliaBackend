import express from "express";
import { createUser, getUsers, getUser, updateUser, deleteUser } from "../controller/userControllers.js";

const userRoute = express.Router();

userRoute.post("/", createUser);        
userRoute.get("/", getUsers);           
userRoute.get("/:id", getUser);         
userRoute.put("/:id", updateUser);      
userRoute.delete("/:id", deleteUser);   

export default userRoute;