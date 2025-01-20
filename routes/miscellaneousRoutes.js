import { Router } from "express";
import { contact, userStatus } from "../controllers/miscellenousController.js";
import { authorizedRoles, isLoggedIn } from "../middlewares/authMiddleware.js";


const router = Router();

router.route('/contact', contact);
router.route('/admin/stats/users').get(isLoggedIn, authorizedRoles(['ADMIN', 'SUPERADMIN']), userStatus)


export default router;