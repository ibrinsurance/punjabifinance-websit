// /api/chat.js - Vercel Serverless Function
// CRITICAL SETUP REQUIRED:
// 1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables  
// 2. Add: ANTHROPIC_API_KEY = sk-ant-api03-your-actual-key-here
// 3. Click Deploy to redeploy after adding the key
// 4. Verify key starts with "sk-ant-" and has no spaces

const SYSTEM = `You are the Punjabi Finance AI — a helpful financial education assistant for the Punjabi and South Asian community in Canada.

You provide free financial education about Canadian personal finance. Be warm, friendly, and speak like a knowledgeable sibling who knows Canadian finance well.

Topics: Life insurance, Super Visa insurance, critical illness, disability, TFSA, RRSP, FHSA, RESP, CPP, OAS, GIS, investing, ETFs, real estate, mortgages, taxes, retirement planning, newcomer finance, credit scores, budgeting.

Rules:
- Focus on CANADIAN rules only (not Indian, US, or UK rules)
- Reply in the same language the user writes in (English or Punjabi)
- Keep answers concise: 150-200 words max unless asked to elaborate
- For insurance questions or personalized advice, suggest: WhatsApp +1 647-745-6850 or ibrinsurance.ca
- Be specific with Canadian numbers: TFSA $7,000/year, RRSP 18% of income, etc.
- Never give specific investment advice — educate and guide to professionals`;

module.exports = async function handler(req, res) {
  // CORS headers — allow requests from any origin
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
    console.error('[PunjabiFinance] ANTHROPIC_API_KEY is not set in Vercel environment variables');
    return res.status(200).json({ 
      content: [{ type: 'text', text: 'Our AI assistant is being set up. Please WhatsApp us directly at +1 647-745-6850 or visit ibrinsurance.ca for immediate help!' }]
    });
  }

  if (!apiKey.startsWith('sk-ant-')) {
    console.error('[PunjabiFinance] API key format invalid — should start with sk-ant-');
    return res.status(200).json({
      content: [{ type: 'text', text: 'AI configuration issue. Please WhatsApp us at +1 647-745-6850 for help!' }]
    });
  }

  try {
    const body = req.body;
    const messages = body && body.messages;
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Valid messages array required' });
    }

    // Keep only last 10 messages to control context window
    const recentMessages = messages.slice(-10);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 400,
        system: SYSTEM,
        messages: recentMessages,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('[PunjabiFinance] Anthropic API error:', response.status, errText);
      
      // Return friendly message instead of error
      return res.status(200).json({
        content: [{ type: 'text', text: 'I had trouble responding right now. Please try again or WhatsApp us at +1 647-745-6850!' }]
      });
    }

    const data = await response.json();
    return res.status(200).json(data);
    
  } catch (err) {
    console.error('[PunjabiFinance] Server error:', err.message);
    return res.status(200).json({
      content: [{ type: 'text', text: 'Something went wrong. Please WhatsApp us directly at +1 647-745-6850 or visit ibrinsurance.ca — we respond quickly!' }]
    });
  }
};
