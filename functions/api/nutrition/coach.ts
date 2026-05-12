export async function onRequest(context: any) {
  const { request, env } = context;

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { 
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const payload = await request.json();
    const groqKey = env.GROQ_API_KEY;

    if (!groqKey) {
      // Return deterministic fallback if key missing
      return new Response(JSON.stringify({
        message: "Coach access restricted. Please configure your environment to enable AI insights.",
        type: 'tip',
        timestamp: Date.now()
      }), { headers: { 'Content-Type': 'application/json' } });
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
        Warnings: ${payload.warnings.join(', ')}
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
        User Goal: ${payload.goal}
        Activity Level: ${payload.activityLevel}
        
        DAILY DATA:
        Calories: ${payload.caloriesConsumed} / ${payload.caloriesTarget} (Remaining: ${payload.caloriesRemaining})
        Macros: P ${payload.proteinConsumed}g/${payload.proteinTarget}g, C ${payload.carbsConsumed}g/${payload.carbsTarget}g, F ${payload.fatConsumed}g/${payload.fatTarget}g
        Hydration: ${payload.hydrationLiters}L / ${payload.hydrationTarget}L
        
        RULES:
        1. Concise (max 3 sentences).
        2. Supportive and elite tone.
        3. Do NOT invent numbers. Use provided data.
        4. Suggest a qualitative adjustment or highlight a success.
        5. Return JSON: { "message": "string", "type": "motivation" | "warning" | "tip" }
      `;
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
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
    
    return new Response(JSON.stringify({
      ...coachResponse,
      timestamp: Date.now()
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'private, max-age=3600'
      }
    });

  } catch (e) {
    return new Response(JSON.stringify({ 
      message: "Steady progress is the key. Keep tracking your intake to build long-term success.",
      type: 'motivation',
      timestamp: Date.now()
    }), { 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
}
