import { generateAIVideo } from "../../src/server/services/groq";

export async function onRequestPost(context: any) {
  try {
    const { request } = context;
    const body = await request.json();
    const { prompt } = body;

    const operation = await generateAIVideo(prompt);

    return new Response(JSON.stringify(operation), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({
      error: "Failed to generate AI video",
      details: error?.message || "Unknown error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}