import "dotenv/config";
import http from "http";
import express from "express";
import { connectMongoDB, disconnectMongoDB } from "./config/mongodb.js";
import { getRedisClient, closeRedis } from "./config/redis.js";
import { getModel } from "./config/ai.js";
import { initSocket } from "./config/socket.js";
import userRouter from "./module/user/user.route.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use("/api/auth", userRouter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

const httpServer = http.createServer(app);

async function startServer() {
  await connectMongoDB();
  getRedisClient();
  getModel();
  initSocket(httpServer);

  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

async function shutdown() {
  console.log("Shutting down...");

  await new Promise((resolve) => {
    httpServer.close(resolve);
  });

  await disconnectMongoDB();
  await closeRedis();

  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

startServer().catch((err) => {
  console.error("Failed to start server:", err.message);
  process.exit(1);
});
