import Redis from "ioredis";

let redisClient = null;

export function getRedisClient() {
  if (!redisClient) {
    const url = process.env.REDIS_URL || "redis://127.0.0.1:6379";

    redisClient = new Redis(url, {
      maxRetriesPerRequest: null,
    });

    redisClient.on("connect", () => {
      console.log("Redis connected");
    });

    redisClient.on("error", (err) => {
      console.error("Redis error:", err.message);
    });
  }

  return redisClient;
}

export async function closeRedis() {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    console.log("Redis disconnected");
  }
}
