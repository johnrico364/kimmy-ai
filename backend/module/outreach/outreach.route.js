import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { generatePitch, getOutreachLogs } from "./outreach.controller.js";

const router = Router();

router.post("/generate-pitch", authenticate, generatePitch);
router.get("/logs/:leadId", authenticate, getOutreachLogs);

export default router;
