import { Router } from "express";
import { createProduct, getAllProducts, getSingleProduct, updateProduct, deleteProduct } from "../controllers/productController.js";
import { multer, storage } from "../middleware/multerMiddleware.js";
import { isAuthenticated, restrictTo, Role } from "../middleware/authMiddleware.js";

const upload = multer({ storage: storage });
const router = Router();

// Public routes
router.route("/getAll").get(getAllProducts);
router.route("/single/:id").get(getSingleProduct);

// Admin only routes
router.route("/create").post(isAuthenticated, restrictTo(Role.Admin), upload.single('image'), createProduct);
router.route("/update/:id").patch(isAuthenticated, restrictTo(Role.Admin), upload.single('image'), updateProduct);
router.route("/delete/:id").delete(isAuthenticated, restrictTo(Role.Admin), deleteProduct);

export default router;