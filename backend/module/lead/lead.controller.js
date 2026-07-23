import { AppError, LeadService } from "./lead.service.js";

const handleError = (res, err) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
    return res.status(400).json({ message });
  }

  if (err.code === 11000) {
    return res.status(409).json({ message: "Duplicate key error" });
  }

  return res.status(500).json({ message: "Internal server error" });
};

export const listLeads = async (req, res) => {
  try {
    const result = await LeadService.list(req.user._id);
    return res.status(200).json(result);
  } catch (err) {
    return handleError(res, err);
  }
};

export const createLead = async (req, res) => {
  try {
    const result = await LeadService.create(req.user._id, req.body);
    return res.status(201).json(result);
  } catch (err) {
    return handleError(res, err);
  }
};

export const getLead = async (req, res) => {
  try {
    const result = await LeadService.getById(req.user._id, req.params.id);
    return res.status(200).json(result);
  } catch (err) {
    return handleError(res, err);
  }
};

export const updateLead = async (req, res) => {
  try {
    const result = await LeadService.update(
      req.user._id,
      req.params.id,
      req.body,
    );
    return res.status(200).json(result);
  } catch (err) {
    return handleError(res, err);
  }
};

export const deleteLead = async (req, res) => {
  try {
    const result = await LeadService.softDelete(req.user._id, req.params.id);
    return res.status(200).json(result);
  } catch (err) {
    return handleError(res, err);
  }
};
