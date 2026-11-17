const words = (s = '') => s.toLowerCase().match(/[a-z0-9']+/g) || [];
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const countPhrase = (text, phrase) =>
  phrase ? (text.toLowerCase().match(new RegExp(escapeRe(phrase.toLowerCase()), 'g')) || []).length : 0;

export const countWords = (blocks = []) => words(blocks.map((b) => b.text).join(' ')).length;

export function analyzeSEO({ title = '', metaDescription = '', blocks = [], primaryKeyword = '', secondaryKeywords = [] }) {
  const body = blocks.map((b) => b.text).join('\n');
  const total = words(body).length;
  const headings = blocks.filter((b) => b.type !== 'p');
  const firstPara = blocks.find((b) => b.type === 'p')?.text || '';
  const kw = primaryKeyword.trim();
  const has = (s) => !!kw && s.toLowerCase().includes(kw.toLowerCase());
  const density = total ? ((countPhrase(body, kw) * kw.split(/\s+/).length) / total) * 100 : 0;
  const sentences = body.split(/[.!?]+\s/).filter(Boolean);
  const avgSentence = sentences.length ? total / sentences.length : 0;
  const secHit = secondaryKeywords.filter((k) => countPhrase(body, k) > 0).length;

  const checks = [
    { id: 'title-len', label: 'Title is 30–60 characters', weight: 10, pass: title.length >= 30 && title.length <= 60, detail: `${title.length} characters` },
    { id: 'title-kw', label: 'Primary keyword is in the title', weight: 15, pass: has(title), detail: kw || 'No primary keyword set' },
    { id: 'meta-len', label: 'Meta description is 120–160 characters', weight: 10, pass: metaDescription.length >= 120 && metaDescription.length <= 160, detail: `${metaDescription.length} characters` },
    { id: 'meta-kw', label: 'Keyword is in the meta description', weight: 5, pass: has(metaDescription), detail: '' },
    { id: 'intro-kw', label: 'Keyword is in the first paragraph', weight: 10, pass: has(firstPara), detail: '' },
    { id: 'density', label: 'Keyword density is 0.5–2.5%', weight: 15, pass: density >= 0.5 && density <= 2.5, detail: `${density.toFixed(2)}% right now` },
    { id: 'heading-kw', label: 'Keyword is in at least one heading', weight: 5, pass: headings.some((h) => has(h.text)), detail: '' },
    { id: 'structure', label: 'Has at least 3 headings', weight: 10, pass: headings.length >= 3, detail: `${headings.length} headings` },
    { id: 'length', label: 'Has at least 600 words', weight: 10, pass: total >= 600, detail: `${total} words` },
    { id: 'readability', label: 'Sentences average 20 words or fewer', weight: 5, pass: avgSentence > 0 && avgSentence <= 20, detail: `${avgSentence.toFixed(1)} words per sentence` },
    { id: 'secondary', label: 'Secondary keywords are used', weight: 5, pass: secondaryKeywords.length === 0 || secHit === secondaryKeywords.length, detail: `${secHit} of ${secondaryKeywords.length} used` },
  ];
  const score = checks.reduce((n, c) => n + (c.pass ? c.weight : 0), 0);
  return { score, checks, stats: { words: total, density: +density.toFixed(2), headings: headings.length, avgSentence: +avgSentence.toFixed(1) } };
}
