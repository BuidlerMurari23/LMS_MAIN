import asyncHandler from "../middlewares/asyncHandlerMiddleware.js";
import User from "../models/userModel.js";
import AppError from "../utils/AppError.js";
import cloudinary from "cloudinary";
import fs from "fs/promises";
import crypto from "crypto";
import SendEmail from "../utils/SendEmail.js";


const cookieOptions = {
    secure: (process.env.NODE_ENV === "development") ? true : false,
    maxAge: 24 * 60 * 60 * 1000,  // only for a day
    httpOnly: true
}

const registerUser = asyncHandler( async (req, res, next) => {
    try {
        const { fullName, email, password } = req.body;
    
        // Checking if the user has inputed all the required data or throw an error
        if(!fullName || !email || !password){
            return next(new AppError("All fields are required", 400))
        }
    
        const userExists = await User.findOne({email});
    
        // checking if user already exists or not
        if(userExists){
            return next(new AppError(`Please use another email. Provided email: ${email} already exists`, 400))
        };
    
        // then create a new user 
        const user = await User.create({
            fullName,
            email,
            password,
            avatar: {
                public_id: email,
                secure_url: 'https://res.cloudinary.com/du9jzqlpt/image/upload/v1674647316/avatar_drzgxv.jpg',
            },
        });
    
        // if user not created then throw an error failed
        if(!user){
            return next(new AppError("Failed to register. Please try again."))
        }
    
        if(req.file){
            try {
                const result = await cloudinary.v2.uploader.upload( req.file.path, {
                    folder: "LMS",
                    height: 250,
                    widht: 250,
                    gravity: "faces",
                    crop: "fill"
                });
    
                if(result){
                    user.avatar.public_id = result.public_id;
                    user.avatar.secure_url = result.secure_url;
    
                    fs.rm(`uploads/${req.file.filename}`)
                }
    
            } catch (e) {
                return next(new AppError(e.message || "file not uploaded. Please try again", 400))
            }
    
            await user.save();
            user.password = undefined;
    
            const token = await user.generateJWTToken();
            console.log(`token:${token}`);
    
            res.cookie('token', token, cookieOptions);
    
            res.status(200).json({
                success: true,
                message: "User registered successfully.",
                user,
            })
        }
        
    } catch (e) {
        return next(new AppError(e.message, 404))
    }
});


const loginUser = asyncHandler( async (req, res, next) => {
    try {
        const { email, password } = req.body;
    
        if(!email || !password){
            return next(new AppError('Email and password are required', 400))
        }
    
        const user = await User.findOne({email}).select('+password');
    
        if(!(user && (await user.comparePassword(password)))){
            return next(new AppError("Email or Password doesnot match. Please try again", 400))
        }
    
        await user.save();
    
        user.password = undefined;
        const token = await user.generateJWTToken();
        res.cookie('token', token, cookieOptions);
        console.log(`token:${token}`)
    
        res.status(200).json({
            success: true,
            message: "User logged in successfully.",
            user,
        });
        
    } catch (e) {
        return next(new AppError(e.message), 404)
    }
});


const logoutUser = asyncHandler( async (req, res, next) => {
    try {
        res.cookie('token', null, {
            secure: process.env.NODE_ENV === "development" ? true : false,
            maxAge: 0,
            httpOnly: true
        });
    
        res.status(200).json({
            success: true,
            message: "User logged out successfully"
        });
        
    } catch (e) {
        return next(new AppError(e.message, 404))
    }
});


const getUserDetails = asyncHandler( async (req, res, next) => {
    try {
        const user = await User.findById(res.user.id);

        res.status(200).json({
            success: true,
            message: "Getting user details",
            user
        });
        
    } catch (e) {
        return next(new AppError(e.message, 404))   
    }

})

const updateUser = asyncHandler( async (req, res, next) => {
    try {
        const { id } = req.params;
        const { fullName } = req.body
        
        const user = await User.findById(id);

        if(!user){
            return next(new AppError(`User doesnot exists with id: ${id}`))
        }

        if(fullName){
            user.fullName = fullName
        }

        if(req.file){
            await cloudinary.v2.uploader.destroy(user.avatar.public_id);

            try {
                const result = await cloudinary.v2.uploader.upload(req.file.path, {
                    folder: "LMS",
                    height: 250,
                    widht: 250,
                    gravity: "faces",
                    crop: "fill"
                })

                if(result){
                    user.avatar.public_id = result.public_id;
                    user.avatar.secure_url = result.secure_url;

                    fs.rm(`uploads/${req.file.filename}`)
                }
            } catch (e) {
                return next(new AppError(e.message || "File not uploaded. Please try again.", 402))
            }

        await user.save();
        
        res.status(200).json({
            success: true,
            message: "User Profile updated successfully.",
            user,
        })
        }

    } catch (e) {
        return next(new AppError(e.message, 404))
    }
})


const forgotPassword = asyncHandler( async (req, res, next) => {
    try {
        const { email } = req.body;
    
        if(!email){
            return next(new AppError("Email is required", 400))
        }

        const user = await User.findOne({email});

        if(!user){
            return next(new AppError(`User doesnot exists with emailID: ${email}`, 402))
        }

        resetToken = await user.generatePasswordResetToken();

        await user.save();

        const resetPasswordUrl = `${process.env.FRONTEND_URL}/resetPassword/${resetToken}`;

        const subject = " Reset Password";
        const message = `You can reset password by clicking <a href=${resetPasswordUrl} target="_blank">Reset Your Password</a>\nIf the above link doesnot work for some reason then copy paste this link in new tab ${resetPasswordUrl}.\n If you have not requested for this, Kindly ignore. `;

        try {
           await SendEmail(email, subject, message);
           
           res.status(200).json({
            success: true,
            message: `Reset Password Token has been send to ${email} successfully.`
           });
        } catch (e) {
            user.forgotPasswordToken = undefined;
            user.forgotPasswordExpiry = undefined;

            await user.save();
            return next(new AppError(e.message, 402))
        }

        user.save();
        
    } catch (e) {
        return next(new AppError(e.message, 404))
    }
});


const resetPassword = asyncHandler( async (req, res, next) => {
    const { resetToken } = req.params;
    const { password } = req.body;

    const forgotPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    if(!password){
        return next(new AppError("Password is required", 400))
    }

    console.log(`forgotPasswordToken: ${forgotPasswordToken}`);

    const user = await User.findOne({
        forgotPasswordToken,
        forgotPasswordExpiry: { $gt: Date.now()}
    });

    if(!user){
        return next(new AppError("Token is invalid or expired. Please try again.", 400))
    }

    user.password = password;

    await user.save();
    user.password = undefined;

    res.status(200).json({
        success: true,
        message: "Password Reset successfully."
    })
});


const changePassword = asyncHandler( async (req, res, next) => {
    const { oldPassword, newPassword } = req.body;
    const { id } = req.body;  // because of isLoggedIn middleware we get id

    if(!oldPassword || !newPassword){
        return next(new AppError("All fields are required", 400))
    }

    const user = await User.findById(id).select('+password');

    if(!user){
        return next(new AppError("User doesnot exists.", 400))
    }

    const isPasswordValid = await user.comparePassword(oldPassword);

    if(!isPasswordValid){
        return next(new AppError("Invalid Old Password", 400))
    }

    user.password = newPassword;

    await user.save()
    user.password = undefined;

    res.status(200).json({
        success: true,
        message: "Password Changed successfully."
    })
});









export {
    registerUser,
    loginUser,
    logoutUser,
    getUserDetails,
    updateUser,
    forgotPassword,
    resetPassword,
    changePassword
}

            
