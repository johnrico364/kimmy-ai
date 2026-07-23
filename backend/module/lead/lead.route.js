import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import {
  listLeads,
  createLead,
  getLead,
  updateLead,
  deleteLead,
} from "./lead.controller.js";

const router = Router();

router.get("/", authenticate, listLeads);
router.post("/", authenticate, createLead);
router.get("/:id", authenticate, getLead);
router.put("/:id", authenticate, updateLead);
router.delete("/:id", authenticate, deleteLead);

export default router;
