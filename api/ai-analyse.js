/**
 * /api/ai-analyse.js — Vercel Edge Function
 * Proxies Groq AI request so the API key stays server-side.
 * Frontend calls this instead of Groq directly.
 */
export const config = { runtime: 'edge' };

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(req) {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  if (req.method !== 'POST') return respond({ error: 'Method not allowed' }, 405);

  const key = process.env.GROQ_API_KEY;
  if (!key) return respond({ error: 'GROQ_API_KEY not configured' }, 500);

  let body;
  try { body = await req.json(); } catch { return respond({ error: 'Invalid JSON' }, 400); }

  const { prompt } = body;
  if (!prompt) return respond({ error: 'Missing prompt' }, 400);

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 600,
        temperature: 0.55,
      }),
    });

    const data = await res.json();
    if (!res.ok) return respond({ error: data.error?.message || 'Groq API error' }, res.status);

    return respond({ result: data.choices[0].message.content });
  } catch (e) {
    return respond({ error: e.message }, 500);
  }
}

function respond(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}
