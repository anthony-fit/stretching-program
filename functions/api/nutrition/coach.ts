import { jsonResponse, errorResponse } from '../../utils/json';

export async function onRequestOptions(context: any) {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function onRequest(context: any) {
  const { request, env } = context;

  if (request.method !== 'POST') {
    return errorResponse('Method not allowed', 405);
  }

  try {
    let payload;
    try {
      payload = await request.json();
    } catch (e) {
      return errorResponse('Invalid JSON payload', 400);
    }
    const groqKey = env.GROQ_API_KEY;

    if (!groqKey) {
      return jsonResponse({
        message: "Coach access restricted. Please configure your environment to enable AI insights.",
        type: 'tip',
        timestamp: Date.now()
      });
    }

    let prompt = '';
    
    if (payload.type === 'recovery') {
      const dnaContext = payload.dna ? `
        ATHLETE DNA PROFILE:
        Archetype: ${payload.dna.athleteType}
        Recovery Bias: ${payload.dna.recoveryBias}
        Fatigue Pattern: ${payload.dna.fatiguePattern}
      ` : '';

      prompt = `
        You are an elite recovery specialist for Stretching Pro.
        RECOVERY DATA:
        Score: ${payload.recoveryScore}/100
        Readiness: ${payload.readiness}
        Hydration: ${payload.hydrationScore}%
        Nutrition: ${payload.nutritionScore}%
        Mobility Consistency: ${payload.mobilityScore}%
        Warnings: ${payload.warnings?.join(', ') || 'None'}
        ${dnaContext}
        
        RULES:
        1. Concise (max 3 sentences).
        2. Technical and elite tone.
        3. Explain the relationship between hydration, protein, and tissue recovery (if score low).
        4. Focus on adaptive resilience given the Athlete DNA Profile (if available).
        5. Return JSON: { "message": "string", "type": "motivation" | "warning" | "tip" }
      `;
    } else {
      prompt = `
        You are an elite performance nutrition coach for Stretching Pro.
        User Goal: ${payload.goal || 'Fitness'}
        Activity Level: ${payload.activityLevel || 'Moderate'}
        
        DAILY DATA:
        Calories: ${payload.caloriesConsumed || 0} / ${payload.caloriesTarget || 2000} (Remaining: ${payload.caloriesRemaining || 2000})
        Macros: P ${payload.proteinConsumed || 0}g/${payload.proteinTarget || 100}g, C ${payload.carbsConsumed || 0}g/${payload.carbsTarget || 200}g, F ${payload.fatConsumed || 0}g/${payload.fatTarget || 70}g
        Hydration: ${payload.hydrationLiters || 0}L / ${payload.hydrationTarget || 2}L
        
        RULES:
        1. Concise (max 3 sentences).
        2. Supportive and elite tone.
        3. Do NOT invent numbers. Use provided data.
        4. Suggest a qualitative adjustment or highlight a success.
        5. Return JSON: { "message": "string", "type": "motivation" | "warning" | "tip" }
      `;
    }

    const response = await fetch(env.GROQ_BASE_URL || env.GROQ_API_URL || 'https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'system', content: prompt }],
        response_format: { type: 'json_object' }
      })
    });

    const data = await response.json();
    const coachResponse = JSON.parse(data.choices[0].message.content);
    
    return jsonResponse({
      ...coachResponse,
      timestamp: Date.now()
    });

  } catch (e) {
    return jsonResponse({ 
      message: "Steady progress is the key. Keep tracking your intake to build long-term success.",
      type: 'motivation',
      timestamp: Date.now()
    });
  }
}
