import { Router } from "express";
import errorHandle from "../services/errorHandler.js";
import { isAuthenticated, restrictTo, Role } from "../middleware/authMiddleware.js";
import { 
    addToCart, 
    getCartItems, 
    getAllCartItems,
    updateCartItem, 
    removeFromCart, 
    clearCart 
} from "../controllers/cartController.js";

const router = Router();

// User routes (authenticated users only)
router.route("/add").post(isAuthenticated, errorHandle(addToCart));
router.route("/my-cart").get(isAuthenticated, errorHandle(getCartItems));
router.route("/update/:id").patch(isAuthenticated, errorHandle(updateCartItem));
router.route("/remove/:id").delete(isAuthenticated, errorHandle(removeFromCart));
router.route("/clear").delete(isAuthenticated, errorHandle(clearCart));

// Admin only routes
router.route("/all").get(isAuthenticated, restrictTo(Role.Admin), errorHandle(getAllCartItems));

export default router;
