import asyncHandler from "../middlewares/asyncHandlerMiddleware.js";
import User from "../models/userModel.js";
import AppError from "../utils/AppError.js";


const assignRole = asyncHandler(async (req, res, next) => {
    try {
        const { role } = req.body;
        const userId = req.params.userId;

        if(!["ADMIN","USER"].includes(role)){
            return next(new AppError("invalid role", 400))
        }

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return next(new AppError("Invalid user ID", 400));
        }

        const user = await User.findByIdAndUpdate(userId, {role}, {new: true});

        if(!user){
            return next(new AppError("User not found", 403))
        }

        res.status(200).json({
            success: true,
            message: "Role updated successfully",
            user
        })
    } catch (e) {
        return next(new AppError(e.message, 404))
    }
});

export default assignRole;


