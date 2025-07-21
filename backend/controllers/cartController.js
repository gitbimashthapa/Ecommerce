import Cart from "../models/cartModel.js";
import Product from "../models/productModel.js";

// Add product to cart
export const addToCart = async (req, res) => {
    const userId = req.user.id;
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
        return res.status(400).json({ message: "Product ID is required" });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
        return res.status(404).json({ message: "Product not found" });
    }

    // Check if product has enough stock
    if (quantity > product.productTotalStockQuantity) {
        return res.status(400).json({ 
            message: `Only ${product.productTotalStockQuantity} items available in stock` 
        });
    }

    // Check if item already exists in cart
    const existingCartItem = await Cart.findOne({ userId, productId });
    
    if (existingCartItem) {
        // Update quantity if item already in cart
        const newQuantity = existingCartItem.quantity + quantity;
        
        if (newQuantity > product.productTotalStockQuantity) {
            return res.status(400).json({ 
                message: `Cannot add ${quantity} more. Only ${product.productTotalStockQuantity - existingCartItem.quantity} more items available` 
            });
        }
        
        existingCartItem.quantity = newQuantity;
        await existingCartItem.save();
        
        return res.status(200).json({ 
            message: "Cart updated successfully", 
            data: existingCartItem 
        });
    }

    // Create new cart item
    const cartItem = await Cart.create({
        userId,
        productId,
        quantity
    });

    res.status(201).json({ message: "Product added to cart successfully", data: cartItem });
};

// Get user's cart items
export const getCartItems = async (req, res) => {
    const userId = req.user.id;

    const cartItems = await Cart.find({ userId })
        .populate('productId', 'productName productPrice productImageUrl productTotalStockQuantity category')
        .sort({ createdAt: -1 });

    if (!cartItems || cartItems.length === 0) {
        return res.status(200).json({ 
            message: "Cart is empty", 
            data: [] 
        });
    }

    // Calculate total amount
    const totalAmount = cartItems.reduce((total, item) => {
        return total + (item.productId.productPrice * item.quantity);
    }, 0);

    res.status(200).json({ 
        message: "Cart items fetched successfully", 
        data: cartItems,
        totalAmount: totalAmount,
        totalItems: cartItems.length
    });
};

// Get all cart items (Admin only)
export const getAllCartItems = async (req, res) => {
    const cartItems = await Cart.find()
        .populate('userId', 'username email')
        .populate('productId', 'productName productPrice productImageUrl category')
        .sort({ createdAt: -1 });

    res.status(200).json({ 
        message: "All cart items fetched successfully", 
        data: cartItems 
    });
};

// Update cart item quantity
export const updateCartItem = async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
        return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    const cartItem = await Cart.findOne({ _id: id, userId }).populate('productId');
    
    if (!cartItem) {
        return res.status(404).json({ message: "Cart item not found" });
    }

    // Check stock availability
    if (quantity > cartItem.productId.productTotalStockQuantity) {
        return res.status(400).json({ 
            message: `Only ${cartItem.productId.productTotalStockQuantity} items available in stock` 
        });
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    res.status(200).json({ 
        message: "Cart item updated successfully", 
        data: cartItem 
    });
};

// Remove item from cart
export const removeFromCart = async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;

    const cartItem = await Cart.findOneAndDelete({ _id: id, userId });

    if (!cartItem) {
        return res.status(404).json({ message: "Cart item not found" });
    }

    res.status(200).json({ message: "Item removed from cart successfully" });
};

// Clear user's entire cart
export const clearCart = async (req, res) => {
    const userId = req.user.id;

    const result = await Cart.deleteMany({ userId });

    res.status(200).json({ 
        message: "Cart cleared successfully", 
        deletedCount: result.deletedCount 
    });
};
