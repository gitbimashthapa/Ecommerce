import { Router } from "express"; // Import Express Router for route handling
import { createProduct, deleteProduct, fetchSingleProduct, getAllProducts, updateProduct } from "../controllers/productController.js"; // Import product controller functions
import {multer, storage} from "../middleware/multerMiddleware.js" // Import multer for file upload handling
import errorHandle from "../services/errorHandler.js"; // Import error handling wrapper
import { isAuthenticated, restrictTo, Role } from "../middleware/authMiddleware.js"; // Import authentication middleware

const upload=multer({storage : storage}); // Configure multer for image uploads
const router=Router(); // Create Express router instance

router.route("/create").post(isAuthenticated, restrictTo(Role.Admin), upload.single('image'), errorHandle(createProduct)) // Create product - admin only with image upload

router.route("/getAll").get(getAllProducts) // Get all products - public access
router.route("/singleProduct/:id").get(errorHandle(fetchSingleProduct)) // Get single product by ID - public access

router.route("/update/:id").patch(isAuthenticated, restrictTo(Role.Admin),upload.single('image'), errorHandle(updateProduct)) // Update product - admin only with optional image
router.route("/delete/:id").delete(isAuthenticated, restrictTo(Role.Admin), errorHandle(deleteProduct)) // Delete product - admin only

export default router; // Export router for use in main app



