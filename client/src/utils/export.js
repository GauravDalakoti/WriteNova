const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const slug = (s) => (s || 'blog').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export function toMarkdown({ title, blocks }) {
  const body = blocks
    .filter((b) => b.text.trim())
    .map((b) => (b.type === 'h2' ? `## ${b.text}` : b.type === 'h3' ? `### ${b.text}` : b.text))
    .join('\n\n');
  return `# ${title}\n\n${body}\n`;
}

export function toHtml({ title, metaDescription, blocks }) {
  const tag = { h2: 'h2', h3: 'h3', p: 'p' };
  const body = blocks.filter((b) => b.text.trim()).map((b) => `  <${tag[b.type]}>${esc(b.text)}</${tag[b.type]}>`).join('\n');
  return `<article>\n  <h1>${esc(title)}</h1>\n${body}\n</article>\n`;
}

export function toFullHtmlPage(draft) {
  return `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<title>${esc(draft.title)}</title>\n<meta name="description" content="${esc(draft.metaDescription || '')}">\n</head>\n<body>\n${toHtml(draft)}</body>\n</html>\n`;
}

export function download(draft, kind) {
  const isMd = kind === 'md';
  const blob = new Blob([isMd ? toMarkdown(draft) : toFullHtmlPage(draft)], { type: isMd ? 'text/markdown' : 'text/html' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${slug(draft.title)}.${kind}`;
  a.click();
  URL.revokeObjectURL(a.href);
}
