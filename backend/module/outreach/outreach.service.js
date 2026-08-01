import Lead from "../lead/lead.model.js";
import OutreachLog from "./outreach.model.js";
import { addPitchJob } from "../../queues/pitch.queue.js";
import { sendEmail } from "./email.service.js";

export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

const toPublicLog = (log) => ({
  id: log._id,
  leadId: log.leadId,
  type: log.type,
  subject: log.subject,
  body: log.body,
  aiMetadata: log.aiMetadata,
  createdAt: log.createdAt,
  updatedAt: log.updatedAt,
});

const toPublicLead = (lead) => ({
  id: lead._id,
  userId: lead.userId,
  firstName: lead.firstName,
  lastName: lead.lastName,
  email: lead.email,
  company: lead.company,
  linkedinBio: lead.linkedinBio,
  status: lead.status,
  createdAt: lead.createdAt,
  updatedAt: lead.updatedAt,
});

async function findOwnedLead(userId, leadId) {
  const lead = await Lead.findOne({
    _id: leadId,
    userId,
    isDeleted: false,
  });

  if (!lead) {
    throw new AppError("Lead not found", 404);
  }

  return lead;
}

async function findOwnedLog(userId, logId) {
  const log = await OutreachLog.findOne({
    _id: logId,
    userId,
    isDeleted: false,
  });

  if (!log) {
    throw new AppError("Outreach log not found", 404);
  }

  return log;
}

export const OutreachService = {
  // Generate a pitch for a lead =========================================
  async generatePitch(user, leadId) {
    if (!leadId) {
      throw new Error("leadId is required", 400);
    }

    const lead = await findOwnedLead(user._id, leadId);

    const job = await addPitchJob({
      leadId: String(lead._id),
      userId: String(user._id),
      firstName: lead.firstName,
      lastName: lead.lastName,
      email: lead.email,
      company: lead.company,
      linkedinBio: lead.linkedinBio,
      companyName: user.companyName,
      companyValueProp: user.companyValueProp,
    });

    return { jobId: job.id };
  },

  // List logs by lead =====================================================
  async listLogsByLead(userId, leadId) {
    await findOwnedLead(userId, leadId);

    const logs = await OutreachLog.find({
      leadId,
      userId,
      isDeleted: false,
    }).sort({ createdAt: 1 });

    return { logs: logs.map(toPublicLog) };
  },

  // Update log (HITL edits) ===============================================
  async updateLog(userId, logId, data) {
    const { subject, body } = data;

    if (subject === undefined && body === undefined) {
      throw new AppError("At least one of subject or body is required", 400);
    }

    if (subject !== undefined && String(subject).trim() === "") {
      throw new AppError("Subject cannot be empty", 400);
    }

    if (body !== undefined && String(body).trim() === "") {
      throw new AppError("Body cannot be empty", 400);
    }

    const log = await findOwnedLog(userId, logId);

    if (subject !== undefined) {
      log.subject = subject;
    }
    if (body !== undefined) {
      log.body = body;
    }

    await log.save();

    return { log: toPublicLog(log) };
  },

  // Send approved draft ===================================================
  async sendLog(userId, logId) {
    if (!logId) {
      throw new AppError("logId is required", 400);
    }

    const log = await findOwnedLog(userId, logId);
    const lead = await findOwnedLead(userId, log.leadId);

    if (lead.status === "emailed") {
      throw new AppError("Email already sent for this lead", 400);
    }

    await sendEmail({
      to: lead.email,
      subject: log.subject,
      body: log.body,
    });

    lead.status = "emailed";
    await lead.save();

    return {
      message: "Email sent",
      log: toPublicLog(log),
      lead: toPublicLead(lead),
    };
  },
};
