// Vercel Serverless Function — Tarot Oracle API
// Calls Alibaba Cloud DashScope (Tongyi Qianwen) for AI tarot readings
// Pure ESM — uses Node.js native fetch (Vercel Runtime: Node 18+)

const DASHSCOPE_API_KEY = process.env.DASHSCOPE_API_KEY || 'sk-e1b8b1dcccdc4c38a1c9bed3ef52641b';
const MODEL = 'qwen-plus';
const API_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';

/**
 * Call DashScope OpenAI-compatible chat completions API via native fetch
 */
async function callQwen(messages, options = {}) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DASHSCOPE_API_KEY}`,
    },
    body: JSON.stringify({
      model: options.model || MODEL,
      messages,
      temperature: options.temperature || 0.85,
      top_p: options.top_p || 0.9,
      max_tokens: options.maxTokens || 2048,
    }),
    // Vercel free tier: max 10s timeout for Hobby plan, 60s for Pro
    signal: AbortSignal.timeout(options.timeout || 25000),
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`DashScope API error (${response.status}): ${errBody}`);
  }

  const json = await response.json();

  if (json.error) {
    throw new Error(json.error.message || 'DashScope API error');
  }

  return json.choices?.[0]?.message?.content || '';
}

/**
 * Build prompt text from drawn cards
 */
function buildCardPrompt(cards, language) {
  return cards.map((c, i) => {
    const pos = c.positionLabel || `Position ${i + 1}`;
    const orientation = c.isReversed
      ? (language === 'cn' ? '\uff08\u9006\u4f4d\uff09' : ' (Reversed)')
      : (language === 'cn' ? '\uff08\u6b63\u4f4d\uff09' : ' (Upright)');
    return `[${pos}] ${c.cardName}${orientation}\n   ${c.meaning}`;
  }).join('\n\n');
}

/**
 * Vercel Serverless Function handler
 */
export default async function handler(req) {
  // Set CORS headers for all responses
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return Response.json(
      { success: false, error: 'Method not allowed. Use POST.' },
      { status: 405, headers: corsHeaders }
    );
  }

  try {
    const body = await req.json();
    const { question, spreadName, language, cards } = body;

    if (!cards || !Array.isArray(cards) || cards.length === 0) {
      return Response.json(
        { success: false, error: 'No cards provided' },
        { status: 400, headers: corsHeaders }
      );
    }

    const isCN = language === 'cn';
    const cardLines = buildCardPrompt(cards, language);

    const systemPrompt = isCN
      ? `\u4f60\u662f\u4e00\u4f4d\u7ecf\u9a8c\u4e30\u5bcc\u7684\u5854\u7f57\u724c\u5360\u535e\u5e08\uff0c\u64c5\u957f\u7528\u795e\u79d8\u800c\u6e29\u6696\u7684\u8bed\u8c03\u89e3\u8bfb\u5854\u7f57\u724c\u9635\u3002\u4f60\u7684\u98ce\u683c\u7279\u70b9\uff1a\n- \u8bed\u8a00\u4f18\u7f8e\u3001\u5bcc\u6709\u8bd7\u610f\uff0c\u5584\u7528\u9690\u55bb\u548c\u610f\u8c61\n- \u89e3\u8bfb\u6df1\u523b\u4f46\u4e0d\u6659\u6da5\uff0c\u7ed9\u4eba\u542f\u53d1\u548c\u529b\u91cf\n- \u6bcf\u5f20\u724c\u7684\u89e3\u8bfb\u8981\u7ed3\u5408\u5b83\u6240\u5728\u7684\u4f4d\u7f6e\u542b\u4e49\n- \u6700\u540e\u7ed9\u51fa\u4e00\u4e2a\u6574\u4f53\u7684\u603b\u7ed3\u548c\u6e29\u67d4\u7684\u5efa\u8bae\n- \u590d\u5b8c\u5168\u4f7f\u7528\u4e2d\u6587\uff0c\u4e0d\u8981\u51fa\u73b0\u82f1\u6587`
      : `You are an experienced tarot reader with a mystical yet warm tone. Your style:\n- Poetic, metaphorical, and evocative language\n- Profound but accessible insights that empower the reader\n- Interpret each card in context of its position\n- End with a gentle overall summary and advice\n- Reply entirely in English`;

    const userPrompt = isCN
      ? `\u8bf7\u4e3a\u6211\u8fdb\u884c\u4e00\u6b21\u5b8c\u6574\u7684\u5854\u7f57\u724c\u89e3\u8bfb\u3002\n\n\u3010\u5360\u535c\u8005\u7684\u95ee\u9898\u3011${question || '(\u672a\u63d0\u51fa\u5174\u4f53\u95ee\u9898\uff0c\u8bf7\u505a\u7efc\u5408\u89e3\u8bfb)'}\n\n\u3010\u4f7f\u7528\u7684\u724c\u9635\u3011${spreadName || '\u672a\u77e5'}\n\n\u3010\u62bd\u51fa\u7684\u724c\u9762\u3011\n${cardLines}\n\n\u8bf7\u4e3a\u6bcf\u4e00\u5f20\u724c\u8be6\u7ec6\u89e3\u8bfb\u5176\u5728\u6b64\u4f4d\u7f6e\u7684\u542b\u4e49\uff0c\u6700\u540e\u7ed9\u51fa\u6574\u4f53\u7684\u7efc\u5408\u5206\u6790\u548c\u5efa\u8bae\u3002\u683c\u5f0f\u6e05\u6997\u7f8e\u89c2\u3002`
      : `Please provide a complete tarot card reading.\n\n[Question] ${question || '(No specific question \u2014 give a general reading)'}\n\n[Spread Used] ${spreadName || 'Unknown'}\n\n[Cards Drawn]\n${cardLines}\n\nPlease interpret each card's meaning in its position in detail, then provide an overall synthesis and guidance. Format beautifully.`;

    console.log(`[Oracle] Request: ${cards.length} cards, lang=${language}`);

    const responseText = await callQwen([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);

    if (!responseText || responseText.trim().length < 10) {
      throw new Error('Empty or too short response from AI');
    }

    console.log(`[Oracle] Response length: ${responseText.length} chars`);

    return Response.json({
      success: true,
      reading: responseText.trim(),
      model: MODEL,
    }, { headers: corsHeaders });

  } catch (err) {
    console.error('[Oracle Error]', err.message);
    return Response.json({
      success: false,
      error: err.message || 'Oracle service unavailable',
    }, { status: 500, headers: corsHeaders });
  }
}
