import { HTTPSTATUS } from "../config/https.config.js";

export const checkRole = (roles) => {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  
  return (req, res, next) => {
    console.log(req?.user?.role)
    console.log(req?.user?.role)

    if (!req.user?._id) {
      return res.status(HTTPSTATUS.UNAUTHORIZED).json({
        success: false,
        message: "Unauthorized - Please login first",
      });
    }

    if (!allowedRoles.includes(req?.user?.role)) {
      return res.status(HTTPSTATUS.FORBIDDEN).json({
        success: false,
        message: "Forbidden - Insufficient permissions",
      });
    }
    
    next();
  };
};

export const isCustomer = checkRole("customer");
export const isAdmin = checkRole("admin");
export const isAnyUser = checkRole(["customer", "admin"]);