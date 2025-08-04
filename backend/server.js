import express from "express"
import connectDB from "./config/mongodb.js"; //import from the mongodb.js 
import userRoutes from "./routes/userRoutes.js"
import productRoutes from "./routes/productRoutes.js"
import categoryRoutes from "./routes/categoryRoutes.js"
import cartRoutes from "./routes/cartRoutes.js"
import orderRoutes from "./routes/orderRoutes.js"
import wishlistRoutes from "./routes/wishlistRoute.js"
import ratingReviewsRoutes from "./routes/ratingReviewRoutes.js"
// import paymentRoutes from "./routes/paymentRoutes.js"

import cors from "cors"

import dotenv from "dotenv"
dotenv.config();


const app=express();
const PORT= process.env.PORT || 3000;

//
app.use(cors())
app.use(express.json());
app.use(express.urlencoded());
app.use(express.static("./storage"));

connectDB()//call the function from the mongodb.js

//Routes
// Test route
app.get("/", (req, res) => {
    res.json({ 
        message: " Exommerce API Server is running!", 
        status: "success",
        endpoints: {
            users: "/api/register, /api/login",
            products: "/api/product",
            categories: "/api/category",
            cart: "/api/cart",
            orders: "/api/order",
            wishlist: "/api/wishlist",
            reviews: "/api/ratingReview",
            payment: "/api/payment"
        }
    });
});

app.use("/api", userRoutes)
app.use("/api/product", productRoutes)
app.use("/api/category", categoryRoutes)
app.use("/api/cart", cartRoutes)
app.use("/api/order", orderRoutes)
app.use("/api/wishlist", wishlistRoutes)
app.use("/api/ratingReview", ratingReviewsRoutes)
// app.use("/api/payment", paymentRoutes)


app.listen(PORT, ()=>{
    console.log(` Server is running on port ${PORT}`)   
    console.log(` Visit: http://localhost:${PORT}`)
    console.log(` API Base: http://localhost:${PORT}/api`)
})