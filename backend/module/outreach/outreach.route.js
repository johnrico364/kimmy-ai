import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import {
  generatePitch,
  getOutreachLogs,
  updateOutreachLog,
  sendOutreach,
} from "./outreach.controller.js";

const router = Router();

router.post("/generate-pitch", authenticate, generatePitch);
router.get("/logs/:leadId", authenticate, getOutreachLogs);
router.put("/logs/:logId", authenticate, updateOutreachLog);
router.post("/send", authenticate, sendOutreach);

export default router;
