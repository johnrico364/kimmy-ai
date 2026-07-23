import validator from "validator";
import Lead from "./lead.model.js";

const VALID_STATUSES = [
  "new",
  "pitch_ready",
  "emailed",
  "replied",
  "unresponsive",
];

export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

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

export const LeadService = {
  async list(userId) {
    const leads = await Lead.find({ userId, isDeleted: false }).sort({
      createdAt: -1,
    });
    return { leads: leads.map(toPublicLead) };
  },

  async create(userId, data) {
    const { firstName, lastName, email, company, linkedinBio, status } = data;

    if (!firstName || !email || !company) {
      throw new AppError("First name, email, and company are required", 400);
    }

    if (!validator.isEmail(email)) {
      throw new AppError("Invalid email address", 400);
    }

    if (status !== undefined && !VALID_STATUSES.includes(status)) {
      throw new AppError(
        `Status must be one of: ${VALID_STATUSES.join(", ")}`,
        400,
      );
    }

    const lead = await Lead.create({
      userId,
      firstName,
      lastName,
      email,
      company,
      linkedinBio,
      status,
    });

    return { lead: toPublicLead(lead) };
  },

  async getById(userId, id) {
    const lead = await Lead.findOne({ _id: id, userId, isDeleted: false });
    if (!lead) {
      throw new AppError("Lead not found", 404);
    }
    return { lead: toPublicLead(lead) };
  },

  async update(userId, id, data) {
    const lead = await Lead.findOne({ _id: id, userId, isDeleted: false });
    if (!lead) {
      throw new AppError("Lead not found", 404);
    }

    const { firstName, lastName, email, company, linkedinBio, status } = data;

    if (email !== undefined) {
      if (!validator.isEmail(email)) {
        throw new AppError("Invalid email address", 400);
      }
      lead.email = email;
    }

    if (status !== undefined) {
      if (!VALID_STATUSES.includes(status)) {
        throw new AppError(
          `Status must be one of: ${VALID_STATUSES.join(", ")}`,
          400,
        );
      }
      lead.status = status;
    }

    if (firstName !== undefined) lead.firstName = firstName;
    if (lastName !== undefined) lead.lastName = lastName;
    if (company !== undefined) lead.company = company;
    if (linkedinBio !== undefined) lead.linkedinBio = linkedinBio;

    await lead.save();
    return { lead: toPublicLead(lead) };
  },

  async softDelete(userId, id) {
    const lead = await Lead.findOneAndUpdate(
      { _id: id, userId, isDeleted: false },
      { isDeleted: true, deletedAt: new Date() },
      { new: true },
    );

    if (!lead) {
      throw new AppError("Lead not found", 404);
    }

    return { message: "Lead deleted" };
  },
};
