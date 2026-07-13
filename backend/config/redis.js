import Redis from "ioredis";

let redisClient = null;
let memoryServer = null;

function attachClientListeners(client) {
  client.on("connect", () => {
    console.log("Redis connected");
  });

  client.on("error", (err) => {
    console.error("Redis error:", err.message);
  });
}

async function tryConnect(url) {
  const client = new Redis(url, {
    maxRetriesPerRequest: null,
    lazyConnect: true,
    retryStrategy: () => null,
    enableOfflineQueue: false,
    autoResubscribe: false,
  });

  const swallowErrors = () => {};
  client.on("error", swallowErrors);

  try {
    await client.connect();
    await client.ping();
    client.removeListener("error", swallowErrors);
    attachClientListeners(client);
    return client;
  } catch (err) {
    client.removeListener("error", swallowErrors);
    client.disconnect();
    throw err;
  }
}

async function startMemoryServer() {
  const { RedisMemoryServer } = await import("redis-memory-server");

  memoryServer = new RedisMemoryServer();
  const host = await memoryServer.getHost();
  const port = await memoryServer.getPort();

  const client = new Redis({ host, port, maxRetriesPerRequest: null });
  await client.ping();
  attachClientListeners(client);

  console.log(`Redis connected (in-memory dev server at ${host}:${port})`);
  return client;
}

export async function connectRedis() {
  if (redisClient) {
    return redisClient;
  }

  const url = process.env.REDIS_URL || "redis://127.0.0.1:6379";

  try {
    redisClient = await tryConnect(url);
  } catch (err) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(`Failed to connect to Redis at ${url}: ${err.message}`);
    }

    console.warn(
      `Could not connect to Redis at ${url}. Starting in-memory Redis for development.`,
    );
    redisClient = await startMemoryServer();
  }

  return redisClient;
}

export function getRedisClient() {
  if (!redisClient) {
    throw new Error("Redis has not been connected. Call connectRedis() first.");
  }

  return redisClient;
}

export async function closeRedis() {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }

  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }

  console.log("Redis disconnected");
}
