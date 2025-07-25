import { Router } from "express";
import errorHandle from "../services/errorHandler.js";
import { isAuthenticated, restrictTo, Role } from "../middleware/authMiddleware.js";
import { createCategory, deleteCategory, fetchSingleCategory, getAllCategory, updateCategory } from "../controllers/categoryController.js";

const router = Router();

// Admin only routes
router.route("/create").post(isAuthenticated, restrictTo(Role.Admin), errorHandle(createCategory))
router.route("/update/:id").patch(isAuthenticated, restrictTo(Role.Admin), errorHandle(updateCategory))
router.route("/delete/:id").delete(isAuthenticated, restrictTo(Role.Admin), errorHandle(deleteCategory))

// Public routes
router.route("/getAll").get(errorHandle(getAllCategory))
router.route("/single/:id").get(errorHandle(fetchSingleCategory))

export default router;