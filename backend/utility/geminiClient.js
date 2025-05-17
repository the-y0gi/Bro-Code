// utils/geminiClient.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import fetch from "node-fetch";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 🎯 Smart instruction
const instruction = `You're a helpful AI named Bro-Code. Answer questions related to programming, math, aptitude, and concept explanation in a simple and clear way. If user sends an image, analyze and respond based on content. Be concise and beginner-friendly.`;

// For text prompts
export const runGeminiTextPrompt = async (text) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(`${instruction}\nUser: ${text}`);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini text error:", error);
    return "Sorry, Bro-Code couldn't process your request.";
  }
};

// For image + text prompts
export const runGeminiImagePrompt = async (text, imageUrl) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

    const imageResponse = await fetch(imageUrl);
    const imageBuffer = await imageResponse.arrayBuffer();

    const imagePart = {
      inlineData: {
        data: Buffer.from(imageBuffer).toString("base64"),
        mimeType: "image/jpeg", // adjust as needed
      },
    };

    const result = await model.generateContent([
      { text: `${instruction}\nUser: ${text}` },
      imagePart,
    ]);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini image error:", error);
    return "Sorry, Bro-Code couldn't analyze the image.";
  }
};
