import express from "express";
import {
  registerUser,
  loginUser,
  getUserProfile,
  logoutUser,
  refreshAccessToken,
} from "../controllers/auth.controller.js";
import {
  updateUserProfile,
  changePassword,
  getAllUsers,
  deleteUser,
} from "../controllers/user.controller.js";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";
import { isAdmin, isAnyUser } from "../middlewares/role.middleware.js";
import asyncHandler from "../middlewares/asyncHandler.js";

const router = express.Router();

router.post("/register", asyncHandler(registerUser));
router.post("/login", asyncHandler(loginUser));
router.post("/refresh-token", asyncHandler(refreshAccessToken));

router.get(
  "/profile",
  verifyAccessToken,
  isAnyUser,
  asyncHandler(getUserProfile)
);
router.put(
  "/profile",
  verifyAccessToken,
  isAnyUser,
  asyncHandler(updateUserProfile)
);
router.put(
  "/change-password",
  verifyAccessToken,
  isAnyUser,
  asyncHandler(changePassword)
);
router.post("/logout", verifyAccessToken, isAnyUser, asyncHandler(logoutUser));

router.get("/all", verifyAccessToken, isAdmin, asyncHandler(getAllUsers));
router.delete("/:userId", verifyAccessToken, isAdmin, asyncHandler(deleteUser));

export default router;
