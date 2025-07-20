import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    productName: { type: String, required: true },
    productDescription: { type: String, required: true },
    productPrice: { type: Number, required: true },
    productTotalStockQuantity: { type: Number, required: true },
    productImageUrl: { type: String },
    totalRating: { type: Number},
    category: { type: String, required: true },
},{timestamps:true});

const Product=mongoose.model("Product", productSchema);

export default Product;
