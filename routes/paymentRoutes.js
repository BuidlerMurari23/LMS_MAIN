import { Router } from "express";
import { 
          authorizedRoles, 
          authorizedSubscribers, 
          isLoggedIn } from "../middlewares/authMiddleware.js";

import { 
          allPayments, 
          buySubscription, 
          cancelSubscription, 
          getRazorpayApiKey, 
          verifySubscription } from "../controllers/paymentController.js";

          

const router = Router();

router.route('/subscribe').post(isLoggedIn, buySubscription);
router.route('/verify').post(isLoggedIn, verifySubscription);
router.route('/unsubscribe').post(isLoggedIn, authorizedSubscribers, cancelSubscription);
router.route('/').get(isLoggedIn, authorizedRoles(['ADMIN', 'SUPERADMIN']), allPayments);
router.route('/razorpay-key').get(isLoggedIn, getRazorpayApiKey);

export default router;