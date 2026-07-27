import Lead from "../lead/lead.model.js";
import OutreachLog from "./outreach.model.js";
import { addPitchJob } from "../../queues/pitch.queue.js";

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

export const OutreachService = {
  async generatePitch(user, leadId) {
    if (!leadId) {
      throw new AppError("leadId is required", 400);
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

  async listLogsByLead(userId, leadId) {
    await findOwnedLead(userId, leadId);

    const logs = await OutreachLog.find({
      leadId,
      userId,
      isDeleted: false,
    }).sort({ createdAt: 1 });

    return { logs: logs.map(toPublicLog) };
  },
};
