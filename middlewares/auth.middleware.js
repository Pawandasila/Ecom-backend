import jwt from "jsonwebtoken";
import asyncHandler from "./asyncHandler.js";
import User from "../models/user.model.js";
import { HTTPSTATUS } from "../config/https.config.js";

export const verifyAccessToken = asyncHandler(async (req, res, next) => {
  try {
    const accessToken =
      req.cookies?.accessToken || req.headers?.authorization?.split(" ")[1];
    
    if (!accessToken) {
      return res
        .status(HTTPSTATUS.UNAUTHORIZED)
        .json({ 
          success: false,
          message: "Access token not found. Please login again." 
        });
    }

    jwt.verify(
      accessToken,
      process.env.JWT_ACCESS_SECRET,
      async (err, decoded) => {
        if (err) {
          return res
            .status(HTTPSTATUS.UNAUTHORIZED)
            .json({ 
              success: false,
              message: "Invalid or expired access token. Please login again." 
            });
        }

        const user = await User.findById(decoded?.userId).select("-password -refreshToken");
        if (!user) {
          return res
            .status(HTTPSTATUS.UNAUTHORIZED)
            .json({ 
              success: false,
              message: "User not found. Please login again." 
            });
        }

        req.user = user;
        next();
      }
    );
  } catch (error) {
    next(error);
  }
});