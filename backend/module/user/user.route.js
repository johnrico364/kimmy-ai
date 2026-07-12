import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { signup, login, getMe, updateProfile } from "./user.controller.js";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", authenticate, getMe);
router.put("/profile", authenticate, updateProfile);

export default router;
