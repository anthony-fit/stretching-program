import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';
dotenv.config();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function test() {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-tts-preview",
    contents: [{ parts: [{ text: "Hello world" }] }] ,
  });
  console.log(response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.mimeType);
  console.log(typeof response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data);
}
test();
