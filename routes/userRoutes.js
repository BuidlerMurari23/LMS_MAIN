import { Router } from "express";
import upload from "../middlewares/multerMiddleware.js";
import { changePassword, forgotPassword, getUserDetails, loginUser, logoutUser, registerUser, resetPassword, updateUser } from "../controllers/userController.js";
import { isLoggedIn } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/register", upload.single("avatar"), registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/me", isLoggedIn, getUserDetails);
router.post("/reset", forgotPassword);
router.post("/reset/:resetToken", resetPassword);
router.post("/changePassword", isLoggedIn, changePassword);
router.put("/update/:id", isLoggedIn, upload.single("avatar"), updateUser)



export default router;