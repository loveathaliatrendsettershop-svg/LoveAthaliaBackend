import 'dotenv/config'; // ✅ must be first line
import express from "express"
import cors from "cors"
import { connectDb } from "./config/db.js";
import productRoute from "./routes/productRoutes.js"
import orderRoute from "./routes/orderRoutes.js";
import userRoute from "./routes/userRoutes.js";
import productCategoryRoute from "./routes/productCategoryRoutes.js";
import logsRoute from "./routes/logsRoutes.js"
import authRoute from "./routes/authRoutes.js"
import sizeRoutes from "./routes/sizeRoutes.js";
import setRoutes from "./routes/setRoutes.js";
import forgotRoute from "./routes/forgotRoutes.js";
import uploadRoute from "./routes/uploadRoutes.js"
import returnRoute from "./routes/returnRoutes.js"
import overdueRoute from "./routes/ovedueSettingRoutes.js"
import dbRoutes from "./routes/db.js"
import lowStockRoutes from "./routes/lowStockSettingRoutes.js"



const app = express();

connectDb();

app.use(cors())
app.use(express.json());

app.use("/api/products", productRoute); // for products
app.use("/api/orders", orderRoute); // for orders
app.use("/api/users", userRoute); // for users
app.use("/api/productcategory", productCategoryRoute); // for categories of product
app.use("/api/auth", authRoute) // for authontication
app.use("/api/logs", logsRoute) // for logs
app.use("/api/sizes", sizeRoutes); // for size
app.use("/api/sets", setRoutes);// fot set
app.use("/api/forgot", forgotRoute)// for change pass
app.use("/api/upload", uploadRoute);// for uploading image
app.use("/api/returns", returnRoute);// for return
app.use("/api/overduesetting", overdueRoute)// for overdue
app.use('/api/db', dbRoutes); // for backup and recovery
app.use("/api/lowstocksetting", lowStockRoutes)// for lowstocksetting



const PORT = process.env.PORT || 5002;

app.listen(PORT, () => {
    console.log(`Server started on port: ${PORT}`);
});