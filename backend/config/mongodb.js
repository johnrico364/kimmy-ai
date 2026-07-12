import mongoose from "mongoose";

export async function connectMongoDB() {
  const uri = process.env.MONGO_DB_URI;

  if (!uri) {
    throw new Error("MONGO_DB_URI is not defined in environment variables");
  }

  await mongoose.connect(uri);
  console.log("MongoDB connected");
}

export async function disconnectMongoDB() {
  await mongoose.disconnect();
  console.log("MongoDB disconnected");
}
