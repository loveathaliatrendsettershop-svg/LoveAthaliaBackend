import express from "express";
import { createProduct, getProducts, updateProduct, toggleProductStatus, getBestSellers } from "../controller/productControllers.js";
const productRoute = express.Router();

productRoute.get('/', getProducts);
productRoute.get('/best-sellers', getBestSellers);
productRoute.post('/', createProduct);
productRoute.put('/:id', updateProduct)
productRoute.patch('/:id/toggle', toggleProductStatus);

export default productRoute;