import RatingReview from "../models/ratingReviewModel.js";
import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";

// Create review and rating
export const createReview = async (req, res) => {
    const userId = req.user.id;
    const { productId, orderId, review, rating } = req.body;

    if (!productId || !orderId || !rating) {
        return res.status(400).json({ message: "Product ID, Order ID, and rating are required" });
    }

    if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    // Check if order is delivered
    const order = await Order.findOne({ _id: orderId, userId });
    if (!order) {
        return res.status(404).json({ message: "Order not found" });
    }

    if (order.orderStatus !== "delivered") {
        return res.status(400).json({ message: "You can only review delivered orders" });
    }

    // Check if review already exists
    const existingReview = await RatingReview.findOne({ userId, productId, orderId });
    if (existingReview) {
        return res.status(400).json({ message: "You have already reviewed this product" });
    }

    const ratingReview = await RatingReview.create({
        userId,
        productId,
        orderId,
        review,
        rating
    });

    res.status(200).json({ message: "Review created successfully", data: ratingReview });
};

// Get all reviews for a product
export const getProductReviews = async (req, res) => {
    const { productId } = req.params;
    const reviews = await RatingReview.find({ productId })
        .populate('userId', 'username')
        .populate('productId', 'productName');
    
    res.status(200).json({ message: "Product reviews fetch successfully", data: reviews });
};

// Get user reviews
export const getUserReviews = async (req, res) => {
    const userId = req.user.id;
    const reviews = await RatingReview.find({ userId })
        .populate('productId', 'productName productImageUrl');
    
    res.status(200).json({ message: "User reviews fetch successfully", data: reviews });
};

// Update review
export const updateReview = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const { review, rating } = req.body;

    if (rating && (rating < 1 || rating > 5)) {
        return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const existingReview = await RatingReview.findOne({ _id: id, userId });
    if (!existingReview) {
        return res.status(404).json({ message: "Review not found" });
    }

    const updatedReview = await RatingReview.findByIdAndUpdate(id, { review, rating }, { new: true });
    res.status(200).json({ message: "Review updated successfully", data: updatedReview });
};

// Delete review
export const deleteReview = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    const review = await RatingReview.findOne({ _id: id, userId });
    if (!review) {
        return res.status(404).json({ message: "Review not found" });
    }

    await RatingReview.findByIdAndDelete(id);
    res.status(200).json({ message: "Review deleted successfully" });
};

// Get all reviews (Admin)
export const getAllReviews = async (req, res) => {
    const reviews = await RatingReview.find()
        .populate('userId', 'username email')
        .populate('productId', 'productName');
    
    res.status(200).json({ message: "All reviews fetch successfully", data: reviews });
};
