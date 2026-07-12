import { AppError, UserService } from "./user.service.js";

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
    return res.status(409).json({ message: "Email already in use" });
  }

  return res.status(500).json({ message: "Internal server error" });
};

export const signup = async (req, res) => {
  try {
    const result = await UserService.signup(req.body);
    return res.status(201).json(result);
  } catch (err) {
    return handleError(res, err);
  }
};

export const login = async (req, res) => {
  try {
    const result = await UserService.login(req.body);
    return res.status(200).json(result);
  } catch (err) {
    return handleError(res, err);
  }
};

export const getMe = async (req, res) => {
  try {
    const result = await UserService.getMe(req.user);
    return res.status(200).json(result);
  } catch (err) {
    return handleError(res, err);
  }
};

export const updateProfile = async (req, res) => {
  try {
    const result = await UserService.updateProfile(req.user._id, req.body);
    return res.status(200).json(result);
  } catch (err) {
    return handleError(res, err);
  }
};
