// /api/chat.js - Vercel Serverless Function
// SETUP: Vercel Dashboard → Your Project → Settings → Environment Variables
// Add: ANTHROPIC_API_KEY = sk-ant-your-key-here
// Then redeploy.

const SYSTEM = `You are the Punjabi Finance AI — a helpful financial education assistant for the Punjabi and South Asian community in Canada.

You provide free financial education about Canadian personal finance. Be warm, friendly, and speak like a knowledgeable sibling who knows Canadian finance well.

Topics: Life insurance, Super Visa insurance, critical illness, disability, TFSA, RRSP, FHSA, RESP, CPP, OAS, GIS, investing, ETFs, real estate, mortgages, taxes, retirement planning, newcomer finance, credit scores, budgeting.

Rules:
- Focus on CANADIAN rules only (not Indian, US, or UK)
- Reply in same language the user writes (English or Punjabi)
- Keep answers concise: 150-200 words max unless asked to elaborate
- For insurance questions, suggest WhatsApp: +1 647-745-6850 or ibrinsurance.ca
- Remind users to consult a licensed Canadian financial professional for personalized advice
- Be encouraging and motivating`;

module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY not set in Vercel environment variables');
    return res.status(500).json({ 
      error: 'API key not configured',
      content: [{ text: 'Chat is currently being set up. Please WhatsApp us at +1 647-745-6850 or visit ibrinsurance.ca for help!' }]
    });
  }

  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages array required' });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 500,
        system: SYSTEM,
        messages: messages.slice(-10) // Keep last 10 messages for context
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Anthropic API error:', response.status, errText);
      return res.status(502).json({ 
        error: 'Upstream API error',
        content: [{ text: 'Sorry, having trouble right now. Please WhatsApp us at +1 647-745-6850!' }]
      });
    }

    const data = await response.json();
    return res.status(200).json(data);
    
  } catch (error) {
    console.error('Handler error:', error);
    return res.status(500).json({ 
      error: error.message,
      content: [{ text: 'Sorry, something went wrong. Please WhatsApp us at +1 647-745-6850 or visit ibrinsurance.ca' }]
    });
  }
};
