import { Router } from "express";
import errorHandle from "../services/errorHandler.js";
import { isAuthenticated, restrictTo, Role } from "../middleware/authMiddleware.js";
import { 
    addToFavourites, 
    removeFromFavourites, 
    getFavourites, 
    getAllFavourites,
    checkFavourite 
} from "../controllers/favouriteController.js";

const router = Router();

// User routes (authenticated users only)
router.route("/add/:productId").post(isAuthenticated, errorHandle(addToFavourites));
router.route("/remove/:productId").delete(isAuthenticated, errorHandle(removeFromFavourites));
router.route("/my-favourites").get(isAuthenticated, errorHandle(getFavourites));
router.route("/check/:productId").get(isAuthenticated, errorHandle(checkFavourite));

// Admin only routes
router.route("/all").get(isAuthenticated, restrictTo(Role.Admin), errorHandle(getAllFavourites));

export default router;
