import { Queue } from "bullmq";
import { getRedisClient } from "../config/redis.js";

const QUEUE_NAME = "pitch-generation";

let pitchQueue = null;

function getPitchQueue() {
  if (!pitchQueue) {
    pitchQueue = new Queue(QUEUE_NAME, {
      connection: getRedisClient(),
    });
  }

  return pitchQueue;
}

export async function addPitchJob(data) {
  const queue = getPitchQueue();
  return queue.add("generate-pitch", data);
}
