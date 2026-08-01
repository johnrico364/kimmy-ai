import { AppError, WebhookService } from "./webhook.service.js";

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

export const simulateReply = async (req, res) => {
  try {
    const result = await WebhookService.simulateReply(req.user._id, req.body);
    return res.status(200).json(result);
  } catch (err) {
    return handleError(res, err);
  }
};
