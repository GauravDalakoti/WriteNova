import crypto from 'crypto';
import asyncHandler from '../utils/asyncHandler.js';
import HttpError from '../utils/httpError.js';
import { askJSON } from '../services/gemini.service.js';
import { analyzeSEO } from '../services/seo.service.js';

const LENGTHS = { short: 600, medium: 1000, long: 1500 };
const clean = (s = '') => String(s).trim().slice(0, 200);

function readBrief(body) {
  const topic = clean(body.topic);
  const primaryKeyword = clean(body.primaryKeyword);
  if (topic.length < 3) throw new HttpError(400, 'Enter a blog topic (at least 3 characters).');
  if (!primaryKeyword) throw new HttpError(400, 'Enter a primary keyword.');
  const secondaryKeywords = (Array.isArray(body.secondaryKeywords) ? body.secondaryKeywords : [])
    .map(clean).filter(Boolean).slice(0, 8);
  return { topic, primaryKeyword, secondaryKeywords, tone: clean(body.tone) || 'conversational', length: body.length };
}

export const headlines = asyncHandler(async (req, res) => {
  const b = readBrief(req.body);
  const out = await askJSON(
`You are an expert SEO editor. Write 8 distinct blog headlines for the topic "${b.topic}".
Primary keyword: "${b.primaryKeyword}". Secondary keywords: ${b.secondaryKeywords.join(', ') || 'none'}. Tone: ${b.tone}.
Rules: 40-60 characters, include the primary keyword naturally, vary the angle (how-to, list, question, contrarian, guide).
Return JSON: {"headlines":[{"title":string,"angle":string}]}`, { temperature: 0.9 });
  res.json({ headlines: (out.headlines || []).slice(0, 8) });
});

export const generate = asyncHandler(async (req, res) => {
  const b = readBrief(req.body);
  const title = clean(req.body.title) || b.topic;
  const target = LENGTHS[b.length] || LENGTHS.medium;
  const out = await askJSON(
`Write an SEO-friendly blog article.
Title: "${title}"
Topic: ${b.topic}
Primary keyword: "${b.primaryKeyword}" (use naturally, about 1% density, include it in the intro and one heading)
Secondary keywords: ${b.secondaryKeywords.join(', ') || 'none'}
Tone: ${b.tone}. Target length: about ${target} words. Keep sentences short (under 20 words on average).
Structure: an introduction (1-2 paragraphs), 4-6 sections each with an h2 heading and 1-3 paragraphs (h3 only when helpful), then a final "Conclusion" h2 with a closing paragraph.
Return JSON only: {"title":string,"metaDescription":string (140-158 chars, includes the primary keyword),"blocks":[{"type":"h2"|"h3"|"p","text":string}]}
Plain text only, no markdown symbols, and do not repeat the title as a block.`);
  const blocks = (out.blocks || []).filter((x) => x?.text).map((x) => ({
    id: crypto.randomUUID(),
    type: ['h2', 'h3', 'p'].includes(x.type) ? x.type : 'p',
    text: String(x.text),
  }));
  if (!blocks.length) throw new HttpError(502, 'The AI did not return any content. Please try again.');
  res.json({ title: out.title || title, metaDescription: out.metaDescription || '', blocks });
});

export const grammar = asyncHandler(async (req, res) => {
  const input = (req.body.blocks || []).filter((x) => x?.text?.trim()).map((x) => ({ id: x.id, text: x.text }));
  if (!input.length) throw new HttpError(400, 'There is no text to check yet.');
  const out = await askJSON(
`You are a careful copy editor. Fix spelling, grammar, punctuation and clarity in each item without changing meaning or voice.
Return JSON: {"blocks":[{"id":string,"text":string}],"issues":[{"id":string,"original":string,"corrected":string,"reason":string}]}
Include every input id in "blocks" (unchanged text if it is fine). "issues" lists each change with short excerpts (max 25).
Input: ${JSON.stringify(input)}`, { temperature: 0.2 });
  res.json({ blocks: out.blocks || input, issues: out.issues || [] });
});

export const seo = asyncHandler(async (req, res) => {
  res.json(analyzeSEO(req.body));
});
