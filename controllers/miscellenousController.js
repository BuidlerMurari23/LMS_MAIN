import asyncHandler from "../middlewares/asyncHandlerMiddleware.js";
import User from "../models/userModel.js";
import AppError from "../utils/AppError.js";
import SendEmail from "../utils/SendEmail.js";


const contact = asyncHandler( async (req, res, next) => {
    try {
        const { name, email, message } = req.body;

        if(!name || !email || !message){
            return next(new AppError("All fields are required.", 400))
        }

        try {
            const subject = "Contact Us Form.";
            const textMessage = `Name: ${name} <br> Email: ${email} <br> Message: ${message}`;

            await SendEmail(process.env.CONTACT_US_EMAIL, subject, textMessage);

        } catch (e) {
            console.log(e.message)
         return next(new AppError(e.message, 403))   
        }

        res.status(200).json({
            success: true,
            message: "Your message and request is submited successfully."
        })

    } catch (e) {
        return next(new AppError(e.message, 404))
    }
});


const userStatus = asyncHandler( async (req, res, next) => {
    try {
        const allUsersCount = await User.countDocuments();

        const subscribedUsersCount = await User.countDocuments({
            'subscription.status': 'active'
        });

        res.status(200).json({
            success: true,
            message: "All registered users are counted.",
            allUsersCount,
            subscribedUsersCount,
        })
    } catch (e) {
        return next(new AppError(e.message, 404))
    }
})



export {
    contact,
    userStatus
}