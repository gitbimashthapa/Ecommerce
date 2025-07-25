import { Router } from "express";
import {  deleteUser, getAllUsers, singleUser, updateUser, userLogin, userProfile, userRegistration, addToFavourites, removeFromFavourites, getFavourites, toggleFavourite, checkFavourite } from "../controllers/userController.js";
import { isAuthenticated, restrictTo, Role } from "../middleware/authMiddleware.js";


const router=Router();

router.route("/register").post(userRegistration);
router.route("/login").post(userLogin);


router.route("/getAll").get(isAuthenticated, restrictTo(Role.Admin) , getAllUsers);
router.route("/profile").get(isAuthenticated , userProfile);
router.route("/singleUser/:id").get(isAuthenticated , singleUser);


router.route("/updateUser/:id").patch(isAuthenticated , updateUser);


router.route("/delete/:id").delete(isAuthenticated, restrictTo(Role.Admin), deleteUser);

// Favourite routes
router.route("/favourite/add/:productId").post(isAuthenticated, addToFavourites);
router.route("/favourite/remove/:productId").delete(isAuthenticated, removeFromFavourites);
router.route("/favourite/check/:productId").get(isAuthenticated, checkFavourite);
router.route("/favourites").get(isAuthenticated, getFavourites);
router.route("/favourite/toggle/:productId").patch(isAuthenticated, toggleFavourite);

export default router
