import express from "express";
import {
  addToCart,
  getCart,
  removeFromCart,
  updateCartItem,
} from "../controllers/cart.controller.js";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import { isAnyUser } from "../middlewares/role.middleware.js";

const router = express.Router();
router.get("/", verifyAccessToken, isAnyUser, asyncHandler(getCart));
router.post("/", verifyAccessToken, isAnyUser, asyncHandler(addToCart));
router.put("/:id", verifyAccessToken, isAnyUser, asyncHandler(updateCartItem));
router.delete(
  "/:id",
  verifyAccessToken,
  isAnyUser,
  asyncHandler(removeFromCart)
);

export default router;
