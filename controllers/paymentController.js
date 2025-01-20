import asyncHandler from "../middlewares/asyncHandlerMiddleware.js";
import Payment from "../models/paymentModel.js";
import User from "../models/userModel.js";
import { razorpay } from "../server.js";
import AppError from "../utils/AppError.js";
import crypto from 'crypto';



const buySubscription = asyncHandler( async (req, res, next) => {
    try {
        const { id } = req.user;

        const user = await User.findById(id);

        if(!user){
            return next(new AppError("Unauhotiezed user. Please Login.", 400))
        }

        if(user.role === "ADMIN" || "SUPERADMIN"){
            return next(new AppError("ADMIN or SUPERADMIN not need to buy buy Subscription."))
        }

        const subscription = await razorpay.subscriptions.create({
            plan_id: process.env.RAZORPAY_PLAN_ID,
            customer_notify: 1,
            total_count: 12
        });

        user.subscription.id = subscription.id;
        user.subscription.status = subscription.status;

        await user.save();

        res.status(200).json({
            success: true,
            message: "subscribed successfully.",
            subscription_id: subscription.id,
        })
    } catch (e) {
        return next(new AppError(e.message, 404))
    }
});


const verifySubscription = asyncHandler( async (req, res, next) => {
    try {
        const { id } = req.user;
        const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature} = req.body;

        const user = await User.findById(id);

        if(!user){
            return next(new AppError(`User doesnot exists with id: ${id}`, 400))
        }

        const subscriptionId = user.subscription.id;

        const generateSignature = crypto.createHash('sha256', process.env.RAZORPAY_SECRET)
                                        .update(`${razorpay_payment_id}|${subscriptionId}`)
                                        .digest('hex');

        if(generateSignature !== razorpay_signature){
            return next(new AppError("Payment Not Varified. Please try again.", 400))
        }

        await Payment.create({
            razorpay_payment_id,
            razorpay_subscription_id,
            razorpay_signature,
        })

        user.subscription.status = 'active';

        await user.sava();

        res.status(200).json({
            success: true,
            message: "Payment Varified successfully.",
        });
    } catch (e) {
        return next(new AppError(e.message, 404))
    }
});


const cancelSubscription = asyncHandler( async (req, res, next) => {
    try {
        const { id } = req.user;

        const user = await User.findById(id);

        if(!user){
            return next(new AppError(`User doesnot exists with id: ${id}`))
        }

        if(user.role === "ADMIN" || "SUPERADMIN"){
            return next(new AppError("ADMIN or SUPERADMIN doesnot need to cancel subscription."))
        }

        const subscriptionId = user.subscription.id;

        try {
            const subscription = await razorpay.subscriptions.cancel(subscriptionId);

            user.subscription.status = subscription.status;

            await user.save();
        } catch (e) {
            return next(new AppError(e.message, 403))
        }

        const payment = await Payment.findOne({
            razorpay_subscription_id: subscriptionId
        });

        const timeSinceSubscribed = Date.now() - payment.createdAt;

        const refundPeriod = 14 * 24 * 60 * 60 * 1000;

        if( refundPeriod <= timeSinceSubscribed){
            return next(new AppError("Refund Period is over.", 400))
        }

        await razorpay.payments.refund(payment.razorpay_payment_id, { speed: 'optimum'});

        user.subscription.id = undefined;
        user.subscription.status = undefined;

        await user.save();
        await payment.remove();

        res.status(200).json({
            success: true,
            message: "Subscription canceled successfully."
        });
    } catch (e) {
        return next(new AppError(e.message, 404))
    }
});


const getRazorpayApiKey = asyncHandler( async (_req, res, next) => {
    try {
        res.status(200).json({
            success: true,
            message: "Got Razorpay Api Key.",
            key: process.env.RAZORPAY_KEY_ID
        })
    } catch (e) {
        return next(new AppError(e.message, 404))
    }
});

const allPayments = asyncHandler( async (req, res, next) => {
    try {
        const { count, skip } = req.query;

        const allPayment = await razorpay.subscriptions.all({
            count: count ? count : 10,
            skip: skip ? skip : 0
        });

        const monthNames = [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December',
        ];

        const finalMonths = {
            January: 0,
            February: 0,
            March: 0,
            April: 0,
            May: 0,
            June: 0,
            July: 0,
            August: 0,
            September: 0,
            October: 0,
            November: 0,
            December: 0,
        };

        const monthlyWisePayments = allPayment.items.map((payment) => {
            const monthInNumber = new Date(payment.start_at * 1000);
            
            return monthNames[monthInNumber.getMonth()];
        });

        monthlyWisePayments.map((month) => {
            Object.keys(finalMonths).forEach((objMonth) => {
                if(month === objMonth){
                    finalMonths[month] += 1
                }
            })
        });

        const monthlySalesRecord = [];

        Object.keys(finalMonths).forEach((monthName) => {
            monthlySalesRecord.push(finalMonths(monthName))
        });


        res.status(200).json({
            success: true,
            message: "App Payments",
            allPayment,
            finalMonths,
            monthlySalesRecord,
        });

    } catch (e) {
        return next(new AppError(e.message, 404))
    }
});



export {
    buySubscription,
    verifySubscription,
    cancelSubscription,
    getRazorpayApiKey,
    allPayments,
}
