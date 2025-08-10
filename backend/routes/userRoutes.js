import { Router } from "express"; // Import Express Router for route handling
import {  deleteUser, getAllUsers, singleUser, updateUser, userLogin, userProfile, userRegistration } from "../controllers/userController.js"; // Import user controller functions
import { isAuthenticated, restrictTo, Role } from "../middleware/authMiddleware.js"; // Import authentication middleware


const router=Router(); // Create Express router instance

router.route("/register").post(userRegistration); // User registration - public access
router.route("/login").post(userLogin); // User login - public access


router.route("/getAll").get(isAuthenticated, restrictTo(Role.Admin) , getAllUsers); // Get all users - admin only
router.route("/profile").get(isAuthenticated , userProfile); // Get user profile - authenticated users only
router.route("/singleUser/:id").get(isAuthenticated , singleUser); // Get specific user by ID - authenticated users only


router.route("/updateUser/:id").patch(isAuthenticated , updateUser); // Update user data - authenticated users only


router.route("/delete/:id").delete(isAuthenticated, restrictTo(Role.Admin), deleteUser); // Delete user - admin only


export default router // Export router for use in main app
