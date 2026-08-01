import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { simulateReply } from "./webhook.controller.js";

const router = Router();

router.post("/simulate-reply", authenticate, simulateReply);

export default router;
