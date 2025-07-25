import Order from "../models/orderModel.js";

export const createOrder = async (req, res) => {
    const userId = req.user.id;
    const { products, shippingAddress, phoneNumber, totalAmount, paymentMethod } = req.body;

    console.log("ShippingAddress : ", shippingAddress);

    if (!userId) {
        return res.status(400).json({ message: "User not found" });
    }

    // Fix validation syntax
    if (!products || products.length === 0 || !shippingAddress || !phoneNumber || !totalAmount || !paymentMethod) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const newOrder = await Order.create({
        userId,
        products,
        phoneNumber,
        totalAmount,
        paymentMethod,
        shippingAddress
        // orderStatus will use default 'pending'
    });

    res.status(201).json({ message: "Order placed successfully", data: newOrder });
};

// Get orders of the logged-in user
export const getMyOrders = async (req, res) => {
    const userId = req.user.id;

    const orders = await Order.find({ userId })
        .populate('products.productId', 'productName productPrice productImageUrl')
        .sort({ createdAt: -1 });

    if (!orders || orders.length === 0) {
        return res.status(200).json({ 
            message: "No orders found", 
            data: [] 
        });
    }

    res.status(200).json({ 
        message: "Orders fetched successfully", 
        data: orders,
        totalOrders: orders.length
    });
};

// Get all orders (Admin only)
export const getAllOrders = async (req, res) => {
    const orders = await Order.find()
        .populate('userId', 'username email')
        .populate('products.productId', 'productName productPrice productImageUrl')
        .sort({ createdAt: -1 });

    res.status(200).json({ 
        message: "All orders fetched successfully", 
        data: orders,
        totalOrders: orders.length
    });
};

// Get single order details
export const getSingleOrder = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    let order;
    
    // Admin can see any order, users can only see their own
    if (userRole === 'admin') {
        order = await Order.findById(id)
            .populate('userId', 'username email')
            .populate('products.productId', 'productName productPrice productImageUrl');
    } else {
        order = await Order.findOne({ _id: id, userId })
            .populate('products.productId', 'productName productPrice productImageUrl');
    }

    if (!order) {
        return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ 
        message: "Order fetched successfully", 
        data: order 
    });
};

// Update order status (Admin only)
export const updateOrderStatus = async (req, res) => {
    const { id } = req.params;
    const { orderStatus } = req.body;

    if (!orderStatus) {
        return res.status(400).json({ message: "Order status is required" });
    }

    const validStatuses = ['pending', 'ontheway', 'delivered', 'cancelled'];
    if (!validStatuses.includes(orderStatus)) {
        return res.status(400).json({ 
            message: "Invalid order status. Valid options: pending, ontheway, delivered, cancelled" 
        });
    }

    const order = await Order.findByIdAndUpdate(
        id, 
        { orderStatus }, 
        { new: true }
    ).populate('products.productId', 'productName productPrice');

    if (!order) {
        return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ 
        message: "Order status updated successfully", 
        data: order 
    });
};

// Delete order
export const deleteOrder = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    let order;
    
    // Admin can delete any order, users can only delete their orders
    if (userRole === 'admin') {
        order = await Order.findByIdAndDelete(id);
    } else {
        // Users can only cancel pending orders
        order = await Order.findOneAndDelete({ 
            _id: id, 
            userId, 
            orderStatus: 'pending' 
        });
    }

    if (!order) {
        return res.status(404).json({ 
            message: userRole === 'admin' 
                ? "Order not found" 
                : "Order not found or cannot be cancelled as pending" 
        });
    }

    res.status(200).json({ message: "Order deleted successfully" });
};