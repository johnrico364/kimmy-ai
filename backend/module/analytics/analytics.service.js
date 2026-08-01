import Lead from "../lead/lead.model.js";
import OutreachLog from "../outreach/outreach.model.js";

export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

const LEAD_STATUSES = [
  "new",
  "pitch_ready",
  "emailed",
  "replied",
  "unresponsive",
];

const OUTREACH_TYPES = ["initial_pitch", "follow_up", "inbound_reply"];
const SENTIMENTS = ["positive", "neutral", "negative"];

function roundRate(numerator, denominator) {
  if (!denominator) return 0;
  return Math.round((numerator / denominator) * 100) / 100;
}

function fillCounts(keys, rows, keyField = "_id") {
  const map = Object.fromEntries(keys.map((k) => [k, 0]));
  for (const row of rows) {
    if (row[keyField] != null && Object.hasOwn(map, row[keyField])) {
      map[row[keyField]] = row.count;
    }
  }
  return map;
}

export const AnalyticsService = {
  async getSummary(userId) {
    const [leadRows, outreachRows, sentimentRows] = await Promise.all([
      Lead.aggregate([
        { $match: { userId, isDeleted: false } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      OutreachLog.aggregate([
        { $match: { userId, isDeleted: false } },
        { $group: { _id: "$type", count: { $sum: 1 } } },
      ]),
      OutreachLog.aggregate([
        {
          $match: {
            userId,
            isDeleted: false,
            type: "inbound_reply",
            "aiMetadata.sentimentAnalysis.sentiment": { $exists: true },
          },
        },
        {
          $group: {
            _id: "$aiMetadata.sentimentAnalysis.sentiment",
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const byStatus = fillCounts(LEAD_STATUSES, leadRows);
    const byType = fillCounts(OUTREACH_TYPES, outreachRows);
    const sentiment = fillCounts(SENTIMENTS, sentimentRows);

    const totalLeads = Object.values(byStatus).reduce((a, b) => a + b, 0);
    const totalOutreach = Object.values(byType).reduce((a, b) => a + b, 0);

    const contacted =
      byStatus.emailed + byStatus.replied + byStatus.unresponsive;

    return {
      leads: {
        total: totalLeads,
        byStatus,
      },
      outreach: {
        total: totalOutreach,
        byType,
      },
      sentiment,
      rates: {
        replyRate: roundRate(byStatus.replied, contacted),
        emailRate: roundRate(contacted, totalLeads),
      },
    };
  },
};
