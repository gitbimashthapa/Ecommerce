import mongoose from "mongoose";

const ratingReviewSchema= new mongoose.Schema({
   userId : {type : mongoose.Schema.Types.ObjectId, ref  : "User", required:True},
   productId : {type : mongoose.Schema.Types.ObjectId, ref  : "Product", required:True},
   review : {type :String},
   rating : {type :Number, required:true, min : 1, max :5}
}, {timestamps :true})

const RatingReview =mongoose.model("RatingReview", ratingReviewSchema);
export default  RatingReview
