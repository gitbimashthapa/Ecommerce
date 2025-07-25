import { Router } from "express";
import errorHandle from "../services/errorHandler.js";
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
router.route("/create").post(isAuthenticated, errorHandle(createOrder));
router.route("/my-orders").get(isAuthenticated, errorHandle(getMyOrders));
router.route("/single/:id").get(isAuthenticated, errorHandle(getSingleOrder));
router.route("/cancel/:id").delete(isAuthenticated, errorHandle(deleteOrder));

// Admin only routes
router.route("/all").get(isAuthenticated, restrictTo(Role.Admin), errorHandle(getAllOrders));
router.route("/update-status/:id").patch(isAuthenticated, restrictTo(Role.Admin), errorHandle(updateOrderStatus));
router.route("/delete/:id").delete(isAuthenticated, restrictTo(Role.Admin), errorHandle(deleteOrder));

export default router;