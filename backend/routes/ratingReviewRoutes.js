import { Router } from "express";
import errorHandle from "../services/errorHandler.js";
import { isAuthenticated, restrictTo, Role } from "../middleware/authMiddleware.js";
import { 
    createReview, 
    getProductReviews, 
    getUserReviews, 
    updateReview, 
    deleteReview, 
    getAllReviews 
} from "../controllers/ratingReviewController.js";

const router = Router();

router.route("/").post(isAuthenticated, errorHandle(createReview))
.get(isAuthenticated, restrictTo(Role.Admin), errorHandle(getAllReviews))

router.route("/myReviews").get(isAuthenticated, errorHandle(getUserReviews))
router.route("/product/:productId").get(errorHandle(getProductReviews))

router.route("/:id").patch(isAuthenticated, errorHandle(updateReview))
.delete(isAuthenticated, errorHandle(deleteReview))

export default router;
