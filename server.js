import 'dotenv/config';
import express from 'express';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '1mb' }));
app.use(express.static(__dirname));

// ── RSS proxy ────────────────────────────────────────────────────────────────
app.get('/api/rss', async (req, res) => {
  const { url, count = '8' } = req.query;
  if (!url) return res.status(400).json({ error: 'Missing url param' });

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NexusBot/1.0)' },
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) return res.status(502).json({ error: 'Feed fetch failed', status: response.status });

    const xml = await response.text();

    // Parse <item> or <entry> elements
    const isAtom = xml.includes('<entry');
    const itemTag = isAtom ? 'entry' : 'item';
    const itemRegex = new RegExp(`<${itemTag}[\\s>][\\s\\S]*?<\\/${itemTag}>`, 'gi');
    const rawItems = xml.match(itemRegex) || [];

    function tag(block, name) {
      // CDATA
      const cd = block.match(new RegExp(`<${name}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]>`, 'i'));
      if (cd) return cd[1].trim();
      const m = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)<\\/${name}>`, 'i'));
      return m ? m[1].replace(/<[^>]+>/g, ' ').trim() : '';
    }
    function attr(block, el, attrName) {
      const m = block.match(new RegExp(`<${el}[^>]*${attrName}="([^"]*)"`, 'i'));
      return m ? m[1] : '';
    }
    function link(block) {
      // <link> text or <link href="..."/>
      const href = attr(block, 'link', 'href');
      if (href) return href;
      const m = block.match(/<link[^>]*>([^<]+)<\/link>/i);
      return m ? m[1].trim() : '';
    }

    const n = Math.min(parseInt(count, 10) || 8, 20);
    const items = rawItems.slice(0, n).map(b => ({
      title: tag(b, 'title'),
      link: link(b),
      description: tag(b, 'description') || tag(b, 'summary') || tag(b, 'content'),
      pubDate: tag(b, 'pubDate') || tag(b, 'published') || tag(b, 'updated'),
      author: tag(b, 'author') || tag(b, 'dc:creator') || '',
    }));

    res.json({ status: 'ok', items });
  } catch (err) {
    console.error('[/api/rss]', err.message);
    res.status(502).json({ error: 'RSS fetch failed', detail: err.message });
  }
});

// ── Anthropic proxy ──────────────────────────────────────────────────────────
app.post('/api/ai', async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'ANTHROPIC_API_KEY not configured' });
  }

  try {
    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(req.body),
      signal: AbortSignal.timeout(30_000),
    });

    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (err) {
    console.error('[/api/ai]', err.message);
    res.status(502).json({ error: 'AI service unavailable', detail: err.message });
  }
});

// ── Catch-all: serve index.html for any unknown path ────────────────────────
app.get('*', (_req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

createServer(app).listen(PORT, () => {
  console.log(`✦ NEXUS running at http://localhost:${PORT}`);
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('⚠  ANTHROPIC_API_KEY not set — AI enrichment will be disabled');
  }
});
