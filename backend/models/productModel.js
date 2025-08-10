// Product model - defines the structure for product data in MongoDB database
import mongoose from "mongoose";

// Schema defines what fields each product document should have and their types
const productSchema = new mongoose.Schema({
    productName: { type: String, required: true }, // Product title (required)
    productDescription: { type: String, required: true }, // Product details (required)
    productPrice: { type: Number, required: true }, // Product cost (required)
    productTotalStockQuantity: { type: Number, required: true }, // Available quantity (required)
    productImageUrl: { type: String }, // Image filename (optional)
    totalRating: { type: Number}, // Average customer rating (optional)
    category: { type: String, required: true }, // Product category (required)
    userId: { type: mongoose.Schema.Types.ObjectId, ref:'User', required: true } // Reference to user who created product
},{timestamps:true}); // Automatically add createdAt and updatedAt fields

// Create Product model from schema - provides methods to interact with products collection
const Product=mongoose.model("Product", productSchema);

export default Product;
