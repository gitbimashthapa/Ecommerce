import mongoose from "mongoose";

const favouriteSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    productId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Product', 
        required: true 
    }
}, { timestamps: true });

// Create compound index to prevent duplicate favorites
favouriteSchema.index({ userId: 1, productId: 1 }, { unique: true });

const Favourite = mongoose.model("Favourite", favouriteSchema);

export default Favourite;
