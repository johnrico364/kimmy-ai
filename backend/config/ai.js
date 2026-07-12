import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI = null;
let model = null;

function initAI() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined in environment variables");
  }

  if (!genAI) {
    genAI = new GoogleGenerativeAI(apiKey);
    const modelName = process.env.GEMINI_MODEL || "gemini-2.0-flash";
    model = genAI.getGenerativeModel({ model: modelName });
    console.log(`AI initialized (model: ${modelName})`);
  }
}

export function getGenAI() {
  initAI();
  return genAI;
}

export function getModel() {
  initAI();
  return model;
}
