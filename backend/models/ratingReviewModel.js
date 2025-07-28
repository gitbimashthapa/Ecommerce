import mongoose from "mongoose";

const ratingReviewSchema= new mongoose.Schema({
   userId : {type : mongoose.Schema.Types.ObjectId, ref  : "User", required: true},
   productId : {type : mongoose.Schema.Types.ObjectId, ref  : "Product", required: true},
   orderId : {type : mongoose.Schema.Types.ObjectId, ref  : "Order", required: true},
   review : {type : String},
   rating : {type : Number, required: true, min : 1, max : 5}
}, {timestamps : true})

// Prevent duplicate reviews - one review per user per product per order
ratingReviewSchema.index({ userId: 1, productId: 1, orderId: 1 }, { unique: true });

const RatingReview = mongoose.model("RatingReview", ratingReviewSchema);
export default RatingReview
