import jwt from "jsonwebtoken";
import asyncHandler from "./asyncHandlerMiddleware.js";
import AppError from "../utils/AppError.js";


const isLoggedIn = asyncHandler( async (req, res, next) => {
    const { token } = res.cookies;

    if(!token){
        return next(new AppError("Unauthorized. Please login again to continue.", 401))
    }

    const decode = await jwt.verify(token, process.env.JWT_SECRET);

    if(!decode){
        return next(new AppError("Unauthorized. Please login again to continue.", 401))
    }

    req.user = decode;

    next()
});


const authorizedRoles = (...roles) => asyncHandler( async (req, _res, next) => {
    if(!roles.includes(req.user.roles)){
        return next(new AppError("You don't have permission to visit this route.", 403))
    }

    next()
});


const authorizedSubscribers = asyncHandler( async (req, _res, next) => {
  if((req.user.role !== "ADMIN" || "SUPERADMIN") && (req.user.subscription.status !== "active")){
    return next(new AppError("Please subscribe to access this route", 403))
  }  

  next();
})

export { 
    isLoggedIn,
    authorizedRoles,
    authorizedSubscribers,
}