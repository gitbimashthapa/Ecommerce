// Product controller - handles all product-related operations (CRUD operations)
import Product from "../models/productModel.js"

// Create new product - adds product to database with image upload
export const createProduct = async (req, res) => {
    const userId=req.user.id; // Get authenticated user's ID
    const { productName, productDescription, productPrice, productTotalStockQuantity, totalRating, category } = req.body; // Extract product data

    // Handle image upload - get filename if file was uploaded
    let productImageUrl;
    if (req.file) {
        productImageUrl = `${req.file.filename}`
    }

    const existingProducts= await Product.findOne({productName}) // Check if product name already exists
    if(existingProducts){
         res.status(400).json({ message: "Product name must be unique "})
    }

    const products = await Product.create({ // Create new product in database
        productName,
        productDescription,
        productPrice,
        productTotalStockQuantity,
        productImageUrl,
        totalRating,
        category,
        userId // Associate product with the user who created it
    })
    res.status(200).json({ message: "Product created successfully", data: products })
}

// Get all products - returns list of all products in database
export const getAllProducts = async (req, res) => {
    const products = await Product.find(); // Fetch all products
    res.status(200).json({ message: "Product fetch successfully", data: products })
}

// Get single product by ID - returns specific product details
export const fetchSingleProduct = async (req, res) => {
    const { id } = req.params; // Extract product ID from URL parameters
    const products = await Product.findById(id); // Find product by ID
    if (!products) { // Product not found
        return res.status(404).json({ message: "Product not found" })
    }
    res.status(200).json({ message: " Single product fetch successfull", data: products })
}

// Update existing product - modifies product information
export const updateProduct = async (req, res) => {
    const { id } = req.params; // Get product ID from URL parameters
    const { productName, productDescription, productPrice, productTotalStockQuantity, totalRating, category } = req.body; // Get updated data
    let productImageUrl;
    if (req.file) { // Handle new image upload if provided
        productImageUrl = `${req.file.filename}`
    }

    const updateProduct = await Product.findByIdAndUpdate(id, { productName, productDescription, productPrice, productTotalStockQuantity, totalRating, category, productImageUrl }, { new: true }) // Update product with new data
    if (!updateProduct) { // Product not found
        return res.status(404).json({ message: "Product not found" })
    }
    res.status(200).json({ message: "Product update successfully", data: updateProduct })
}

// Delete product - removes product from database
export const deleteProduct= async(req, res)=>{
    const{id}=req.params; // Get product ID from URL parameters
    const products= await Product.findByIdAndDelete(id); // Delete product by ID
    if(!products){ // Product not found
        return res.status(404).json({ message: "Product not found" })
    }
    res.status(200).json({ message: "Product deleted successfully"})
}