import { Router } from "express";
import { isAuthenticated } from "../middleware/authMiddleware.js";
import { 
    initiateKhaltiPayment, 
    verifyKhaltiPayment
} from "../controllers/paymentController.js";

const router = Router();

// Initiate Khalti payment
router.post("/khalti/initiate", isAuthenticated, initiateKhaltiPayment);

// Verify Khalti payment
router.post("/khalti/verify", isAuthenticated, verifyKhaltiPayment);

export default router;
