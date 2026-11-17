import HttpError from '../utils/httpError.js';

/** Calls Google Gemini and returns parsed JSON. */
export async function askJSON(prompt, { temperature = 0.7 } = {}) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new HttpError(500, 'GEMINI_API_KEY is not set on the server.');
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature, responseMimeType: 'application/json' },
    }),
  });
  if (!res.ok) {
    console.error('Gemini error:', await res.text());
    throw new HttpError(502, 'The AI service could not complete that request. Try again in a moment.');
  }
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '';
  try { return JSON.parse(text.replace(/```json|```/g, '').trim()); }
  catch { throw new HttpError(502, 'The AI returned an unreadable response. Please try again.'); }
}
