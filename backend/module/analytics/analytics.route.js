import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { getSummary } from "./analytics.controller.js";

const router = Router();

router.get("/summary", authenticate, getSummary);

export default router;
