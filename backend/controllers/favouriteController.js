import Favourite from "../models/favouriteModel.js";
import User from "../models/userModel.js";

// Add product to favourites
export const addToFavourites = async (req, res) => {
    const { productId } = req.params;
    const userId = req.user.id;

    if (!productId) {
        return res.status(400).json({ message: "Product ID is required" });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    // Check if favourite already exists
    const existingFavourite = await Favourite.findOne({ userId, productId });
    if (existingFavourite) {
        return res.status(400).json({ message: "Product already in favourites" });
    }

    // Create new favourite entry
    const newFavourite = await Favourite.create({ userId, productId });

    res.status(200).json({ 
        message: "Product added to favourites successfully", 
        data: newFavourite 
    });
};

// Remove product from favourites
export const removeFromFavourites = async (req, res) => {
    const { productId } = req.params;
    const userId = req.user.id;

    if (!productId) {
        return res.status(400).json({ message: "Product ID is required" });
    }

    // Find and delete the favourite entry
    const deletedFavourite = await Favourite.findOneAndDelete({ userId, productId });

    if (!deletedFavourite) {
        return res.status(404).json({ message: "Favourite not found" });
    }

    res.status(200).json({ 
        message: "Product removed from favourites successfully",
        data: deletedFavourite 
    });
};

// Get user's favourite products
export const getFavourites = async (req, res) => {
    const userId = req.user.id;

    // Find all favourites for the user and populate product details
    const favourites = await Favourite.find({ userId })
        .populate('productId', 'productName productPrice productImageUrl productDescription category')
        .populate('userId', 'username email')
        .sort({ createdAt: -1 }); // Most recent first

    if (!favourites || favourites.length === 0) {
        return res.status(200).json({ 
            message: "No favourite products found", 
            data: [] 
        });
    }

    res.status(200).json({ 
        message: "Favourite products fetched successfully", 
        data: favourites,
        totalFavourites: favourites.length
    });
};

// Get all favourites (Admin only)
export const getAllFavourites = async (req, res) => {
    const favourites = await Favourite.find()
        .populate('productId', 'productName productPrice productImageUrl')
        .populate('userId', 'username email')
        .sort({ createdAt: -1 });

    res.status(200).json({ 
        message: "All favourites fetched successfully", 
        data: favourites,
        totalFavourites: favourites.length
    });
};

// Check if product is in user's favourites
export const checkFavourite = async (req, res) => {
    const { productId } = req.params;
    const userId = req.user.id;

    if (!productId) {
        return res.status(400).json({ message: "Product ID is required" });
    }

    const favourite = await Favourite.findOne({ userId, productId });
    const isFavourite = !!favourite;

    res.status(200).json({ 
        message: "Favourite status checked successfully",
        isFavourite: isFavourite,
        productId: productId,
        data: favourite
    });
};
