import express from "express";
import {
  createOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
} from "../controllers/order.controller.js";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import { isAnyUser } from "../middlewares/role.middleware.js";

const router = express.Router();

router.post(
  "/",
  verifyAccessToken,
  isAnyUser,
  asyncHandler(createOrder)
);

router.get(
  "/all",
  verifyAccessToken,
  isAnyUser,
  asyncHandler(getAllOrders)
);


router.get(
  "/",
  verifyAccessToken,
  isAnyUser,
  asyncHandler(getUserOrders)
);

router.get(
  "/:orderId",
  verifyAccessToken,
  isAnyUser,
  asyncHandler(getOrderById)
);

router.patch(
  "/:orderId/cancel",
  verifyAccessToken,
  isAnyUser,
  asyncHandler(cancelOrder)
);

export default router;
