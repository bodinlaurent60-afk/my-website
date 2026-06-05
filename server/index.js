const express = require('express');
const cors = require('cors');
const path = require('path');
const https = require('https');

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// ── Serve static frontend files ─────────────────────────
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// ── Config ──────────────────────────────────────────────
const DASHSCOPE_API_KEY = process.env.DASHSCOPE_API_KEY || 'sk-e1b8b1dcccdc4c38a1c9bed3ef52641b';
const MODEL = 'qwen-plus'; // or qwen-turbo for faster/cheaper

// ── Helper: call DashScope (OpenAI-compatible) ───────────
function callQwen(messages, options = {}) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: options.model || MODEL,
      messages,
      temperature: options.temperature || 0.85,
      top_p: options.top_p || 0.9,
      max_tokens: options.maxTokens || 2048,
    });

    const url = new URL('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions');
    const reqOptions = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DASHSCOPE_API_KEY}`,
        'Content-Length': Buffer.byteLength(body),
      },
      timeout: 60000,
    };

    const req = https.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.error) return reject(new Error(json.error.message || 'API error'));
          resolve(json.choices?.[0]?.message?.content || '');
        } catch (e) {
          reject(new Error(`Parse error: ${e.message}`));
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('API timeout')); });
    req.write(body);
    req.end();
  });
}

// ── API: Oracle reading ─────────────────────────────────
app.post('/api/oracle', async (req, res) => {
  try {
    const { question, spreadName, language, cards } = req.body;

    if (!cards || !Array.isArray(cards) || cards.length === 0) {
      return res.status(400).json({ error: 'No cards provided' });
    }

    // Build card info text
    const cardLines = cards.map((c, i) => {
      const pos = c.positionLabel || `Position ${i + 1}`;
      const orientation = c.isReversed
        ? (language === 'cn' ? '（逆位）' : ' (Reversed)')
        : (language === 'cn' ? '（正位）' : ' (Upright)');
      return `[${pos}] ${c.cardName}${orientation}\n   ${c.meaning}`;
    }).join('\n\n');

    // Build system prompt & user prompt based on language
    const isCN = language === 'cn';

    const systemPrompt = isCN
      ? `你是一位经验丰富的塔罗牌占卜师，擅长用神秘而温暖的语调解读塔罗牌阵。你的风格特点：
- 语言优美、富有诗意，善用隐喻和意象
- 解读深刻但不晦涩，给人启发和力量
- 每张牌的解读要结合它所在的位置含义
- 最后给出一个整体的总结和温柔的建议
- 回复完全使用中文，不要出现英文`
      : `You are an experienced tarot reader with a mystical yet warm tone. Your style:
- Poetic, metaphorical, and evocative language
- Profound but accessible insights that empower the reader
- Interpret each card in context of its position
- End with a gentle overall summary and advice
- Reply entirely in English`;

    const userPrompt = isCN
      ? `请为我进行一次完整的塔罗牌解读。

【占卜者的问题】${question || '(未提出具体问题，请做综合解读)'}

【使用的牌阵】${spreadName || '未知'}

【抽出的牌面】
${cardLines}

请为每一张牌详细解读其在此位置的含义，最后给出整体的综合分析和建议。格式清晰美观。`
      : `Please provide a complete tarot card reading.

[Question] ${question || '(No specific question — give a general reading)'}

[Spread Used] ${spreadName || 'Unknown'}

[Cards Drawn]
${cardLines}

Please interpret each card's meaning in its position in detail, then provide an overall synthesis and guidance. Format beautifully.`;

    console.log(`[Oracle] Request: ${cards.length} cards, lang=${language}`);

    const responseText = await callQwen([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);

    if (!responseText || responseText.trim().length < 10) {
      throw new Error('Empty or too short response from AI');
    }

    console.log(`[Oracle] Response length: ${responseText.length} chars`);

    res.json({
      success: true,
      reading: responseText.trim(),
      model: MODEL,
    });
  } catch (err) {
    console.error('[Oracle Error]', err.message);
    res.status(500).json({
      success: false,
      error: err.message || 'Oracle service unavailable',
    });
  }
});

// ── Health check ─────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', model: MODEL, timestamp: new Date().toISOString() });
});

// ── SPA fallback: serve index.html for all non-API routes
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// ── Start server ─────────────────────────────────────────
const PORT = parseInt(process.env.PORT || '3001');
app.listen(PORT, () => {
  console.log(`\n☽ Tarot Oracle Server running on http://localhost:${PORT}`);
  console.log(`   Model: ${MODEL}`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
  console.log('');
});
