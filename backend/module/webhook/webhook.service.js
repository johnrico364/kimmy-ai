import Lead from "../lead/lead.model.js";
import OutreachLog from "../outreach/outreach.model.js";
import { getModel } from "../../config/ai.js";
import { getIO } from "../../config/socket.js";

export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

const SENTIMENTS = new Set(["positive", "neutral", "negative"]);
const URGENCIES = new Set(["high", "medium", "low"]);

const FALLBACK_SENTIMENT = {
  sentiment: "neutral",
  urgency: "low",
  summary: "Unable to classify reply.",
};

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

function stripJsonFences(text) {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenced ? fenced[1].trim() : trimmed;
}

function normalizeSentiment(parsed) {
  if (!parsed || typeof parsed !== "object") {
    return FALLBACK_SENTIMENT;
  }

  const sentiment = String(parsed.sentiment || "").toLowerCase();
  const urgency = String(parsed.urgency || "").toLowerCase();
  const summary =
    typeof parsed.summary === "string" && parsed.summary.trim()
      ? parsed.summary.trim()
      : FALLBACK_SENTIMENT.summary;

  if (!SENTIMENTS.has(sentiment) || !URGENCIES.has(urgency)) {
    return FALLBACK_SENTIMENT;
  }

  return { sentiment, urgency, summary };
}

async function classifySentiment(replyText) {
  const model = getModel();
  const prompt = `Classify the sentiment of this sales prospect email reply.
Return ONLY valid JSON with exactly these keys:
- sentiment: one of "positive", "neutral", "negative"
- urgency: one of "high", "medium", "low"
- summary: a one-sentence summary of the reply intent

Reply text:
"""
${replyText}
"""`;

  try {
    const result = await model.generateContent(prompt);
    const raw = result.response.text();
    const parsed = JSON.parse(stripJsonFences(raw));
    return normalizeSentiment(parsed);
  } catch {
    return FALLBACK_SENTIMENT;
  }
}

async function resolveSubject(userId, leadId, subject) {
  if (subject !== undefined && String(subject).trim() !== "") {
    return String(subject).trim();
  }

  const lastOutbound = await OutreachLog.findOne({
    leadId,
    userId,
    isDeleted: false,
    type: { $in: ["initial_pitch", "follow_up"] },
  }).sort({ createdAt: -1 });

  if (lastOutbound?.subject) {
    const base = lastOutbound.subject.replace(/^Re:\s*/i, "");
    return `Re: ${base}`;
  }

  return "Re: Outreach reply";
}

export const WebhookService = {
  async simulateReply(userId, data) {
    const { leadId, body, subject } = data;

    if (!leadId) {
      throw new AppError("leadId is required", 400);
    }

    if (body === undefined || String(body).trim() === "") {
      throw new AppError("body is required", 400);
    }

    const replyBody = String(body).trim();

    const lead = await Lead.findOne({
      _id: leadId,
      userId,
      isDeleted: false,
    });

    if (!lead) {
      throw new AppError("Lead not found", 404);
    }

    const sentimentAnalysis = await classifySentiment(replyBody);
    const resolvedSubject = await resolveSubject(userId, leadId, subject);
    const modelUsed = process.env.GEMINI_MODEL || "gemini-2.0-flash";

    const log = await OutreachLog.create({
      leadId: lead._id,
      userId,
      type: "inbound_reply",
      subject: resolvedSubject,
      body: replyBody,
      aiMetadata: {
        modelUsed,
        sentimentAnalysis,
      },
    });

    lead.status = "replied";
    await lead.save();

    const publicLog = toPublicLog(log);
    const publicLead = toPublicLead(lead);

    getIO().emit("reply:received", {
      leadId: String(lead._id),
      lead: publicLead,
      log: publicLog,
    });

    return {
      message: "Reply simulated",
      log: publicLog,
      lead: publicLead,
    };
  },
};
