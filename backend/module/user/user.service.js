import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "./user.model.js";

export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

const toPublicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  companyName: user.companyName,
  companyValueProp: user.companyValueProp,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const signToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });

export const UserService = {
  // SIGN UP USER ====================================================
  async signup({
    name,
    email,
    password,
    companyName,
    companyValueProp,
  }) {
    if (!name || !email || !password) {
      throw new AppError("Name, email, and password are required", 400);
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError("Email already in use", 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      companyName,
      companyValueProp,
    });

    const token = signToken(user._id);
    return { token, user: toPublicUser(user) };
  },

  // LOGIN USER ====================================================
  async login({ email, password }) {
    if (!email || !password) {
      throw new AppError("Email and password are required", 400);
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new AppError("Invalid email or password", 401);
    }

    const token = signToken(user._id);
    return { token, user: toPublicUser(user) };
  },

  // GET USER PROFILE ====================================================
  async getMe(user) {
    return { user: toPublicUser(user) };
  },

  // UPDATE USER PROFILE ====================================================
  async updateProfile(userId, { name, companyName, companyValueProp }) {
    const updates = {};

    if (name !== undefined) updates.name = name;
    if (companyName !== undefined) updates.companyName = companyName;
    if (companyValueProp !== undefined)
      updates.companyValueProp = companyValueProp;

    const user = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    });

    return { user: toPublicUser(user) };
  },
};
