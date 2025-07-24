import { Router } from "express";
import errorHandler from "../services/erroHandler.js";
import { 
    createOrder, 
    getMyOrders, 
    getAllOrders, 
    getSingleOrder, 
    updateOrderStatus, 
    deleteOrder 
} from "../controllers/orderController.js";
import { isAuthenticated, restrictTo, Role } from "../middleware/authMiddleware.js";

const router = Router();

// User routes (authenticated users)
router.route("/create").post(isAuthenticated, errorHandler(createOrder));
router.route("/my-orders").get(isAuthenticated, errorHandler(getMyOrders));
router.route("/single/:id").get(isAuthenticated, errorHandler(getSingleOrder));
router.route("/cancel/:id").delete(isAuthenticated, errorHandler(deleteOrder));

// Admin only routes
router.route("/all").get(isAuthenticated, restrictTo(Role.Admin), errorHandler(getAllOrders));
router.route("/update-status/:id").patch(isAuthenticated, restrictTo(Role.Admin), errorHandler(updateOrderStatus));
router.route("/delete/:id").delete(isAuthenticated, restrictTo(Role.Admin), errorHandler(deleteOrder));

export default router;