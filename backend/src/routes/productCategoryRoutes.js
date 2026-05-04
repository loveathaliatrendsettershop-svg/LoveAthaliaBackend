import express from "express";
import { getAllCategory, createCategory, updateCategory, deleteCategory } from "../controller/productCategoryControllers.js";

const productCategoryRoute = express.Router();

productCategoryRoute.get('/', getAllCategory);
productCategoryRoute.post('/', createCategory);
productCategoryRoute.put("/:id", updateCategory);
productCategoryRoute.delete("/:id", deleteCategory);

export default productCategoryRoute;