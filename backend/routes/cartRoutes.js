import { Router } from "express";
import errorHandler from "../services/erroHandler.js";
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
router.route("/add").post(isAuthenticated, errorHandler(addToCart));
router.route("/my-cart").get(isAuthenticated, errorHandler(getCartItems));
router.route("/update/:id").patch(isAuthenticated, errorHandler(updateCartItem));
router.route("/remove/:id").delete(isAuthenticated, errorHandler(removeFromCart));
router.route("/clear").delete(isAuthenticated, errorHandler(clearCart));

// Admin only routes
router.route("/all").get(isAuthenticated, restrictTo(Role.Admin), errorHandler(getAllCartItems));

export default router;
