import { Router } from "express";
import { createProduct, getAllProducts } from "../controllers/productController.js";
import {multer, storage} from "../middleware/multerMiddleware.js"

const upload=multer({storage : storage});
const router=Router();


router.route("/create").post(upload.single('image'), createProduct)
router.route("/getAll").get(getAllProducts)

export default router;