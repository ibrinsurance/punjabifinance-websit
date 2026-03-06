// /api/chat.js - Vercel Edge Function
// Add ANTHROPIC_API_KEY to your Vercel environment variables
export const config = { runtime: 'edge' };

const SYSTEM = `You are the Punjabi Finance AI assistant — a helpful, friendly financial education bot for the Punjabi community in Canada.

Your role: Provide free financial education about Canadian personal finance.
Topics: life insurance, Super Visa insurance, critical illness, disability, TFSA, RRSP, FHSA, RESP, investing, real estate, mortgages, taxes, retirement, newcomer finance.
- Always remind users to consult a licensed professional for personal financial advice
- Be warm and community-focused — this is for the Punjabi diaspora in Canada  
- Respond in the same language the user writes in (English or Punjabi)
- Keep answers concise and practical — max 200 words
- For insurance questions, suggest WhatsApp: +1 647-745-6850 or ibrinsurance.ca
- Never give specific investment recommendations or specific insurance quotes

Personality: Like a financially savvy older sibling who knows Canadian finance inside out.`;

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }
  
  const body = await req.json();
  const messages = body.messages || [];
  
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      system: SYSTEM,
      messages: messages
    })
  });
  
  const data = await response.json();
  
  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    }
  });
}
