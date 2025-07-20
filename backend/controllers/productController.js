import Product from "../models/productModel.js"

//creat product api
export const createProduct = async (req, res) => {
    try {
        console.log("Request body:", req.body);
        console.log("Request file:", req.file);
        
        const { productName, productDescription, productPrice, productTotalStockQuantity, totalRating, category } = req.body;

        let productImageUrl;
        if (req.file) {
            productImageUrl = `${req.file.filename}`
        }

        const products = await Product.create({
            productName,
            productDescription,
            productPrice,
            productTotalStockQuantity,
            productImageUrl,
            totalRating,
            category
        })
        res.status(200).json({ message: "Product created successfully", data: products })
    } catch (err) {
        console.error("Create product error:", err);
        res.status(500).json({ message: "Internal server error" })
    }
}

//fetch all products
export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json({ message: "Product fetch successfully", data: products })
    } catch (err) {
        res.status(500).json({ message: "Internal server error" })
    }
}

//get single product
export const getSingleProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);
        
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        
        res.status(200).json({ message: "Product fetched successfully", data: product });
    } catch (err) {
        res.status(500).json({ message: "Internal server error" });
    }
}

//update product
export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { productName, productDescription, productPrice, productTotalStockQuantity, totalRating, category } = req.body;
        
        // Check if product exists
        const existingProduct = await Product.findById(id);
        if (!existingProduct) {
            return res.status(404).json({ message: "Product not found" });
        }
        
        // Handle image update if new file is uploaded
        let updateData = {
            productName,
            productDescription,
            productPrice,
            productTotalStockQuantity,
            totalRating,
            category
        };
        
        if (req.file) {
            updateData.productImageUrl = req.file.filename;
        }
        
        // Remove undefined values to avoid updating with undefined
        Object.keys(updateData).forEach(key => {
            if (updateData[key] === undefined) {
                delete updateData[key];
            }
        });
        
        const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true });
        
        res.status(200).json({ message: "Product updated successfully", data: updatedProduct });
    } catch (err) {
        res.status(500).json({ message: "Internal server error" });
    }
}

//delete product
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findByIdAndDelete(id);
        
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        
        res.status(200).json({ message: "Product deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Internal server error" });
    }
}
