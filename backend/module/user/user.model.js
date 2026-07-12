import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false, // Prevents password from being accidentally returned in API responses
    },
    companyName: {
      type: String,
      trim: true,
    },
    companyValueProp: {
      type: String,
      maxLength: 1000, // Context provided to the AI about what the user sells
    },
  },
  { timestamps: true },
);

export default mongoose.model("User", UserSchema);
