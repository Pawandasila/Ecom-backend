import express from "express";
import asyncHandler from "../middlewares/asyncHandler.js";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  updateProduct,
} from "../controllers/product.controller.js";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";
import { isAdmin , isAnyUser } from "../middlewares/role.middleware.js";


const router = express.Router();

router.post("/", verifyAccessToken, isAdmin, asyncHandler(createProduct));
router.get("/", verifyAccessToken, isAnyUser, asyncHandler(getAllProducts));
router.get("/:id", verifyAccessToken, isAnyUser, asyncHandler(getProductById));
router.put("/:id", verifyAccessToken, isAdmin, asyncHandler(updateProduct));
router.delete("/:id", verifyAccessToken, isAdmin, asyncHandler(deleteProduct));

export default router;
