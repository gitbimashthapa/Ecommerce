import { Router } from "express";
import errorHandle from "../services/errorHandler.js";
import { isAuthenticated, restrictTo, Role } from "../middleware/authMiddleware.js";
import { createCategory, deleteCategory, fetchSingleCategory, getAllCategory, updateCategory } from "../controllers/categoryController.js";
const router=Router();

router.route("/create").post(isAuthenticated, restrictTo(Role.Admin),errorHandle(createCategory))

router.route("/getAll").get(getAllCategory)
router.route("/singleCategory/:id").get(errorHandle(fetchSingleCategory))

router.route("/update/:id").patch(isAuthenticated, restrictTo(Role.Admin), errorHandle(updateCategory))
router.route("/delete/:id").delete(isAuthenticated, restrictTo(Role.Admin), errorHandle(deleteCategory))

export default router;