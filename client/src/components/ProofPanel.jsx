import { useState } from 'react';
import { Check, Copy, Download, X } from 'lucide-react';
import { useBlog } from '../hooks/useBlog.js';
import { download, toHtml, toMarkdown } from '../utils/export.js';

function Dial({ score }) {
  const tone = score >= 80 ? 'var(--color-pine)' : score >= 50 ? '#d99a00' : 'var(--color-redpen)';
  return (
    <div role="img" aria-label={`SEO score ${score} out of 100`}
      className="grid size-24 shrink-0 place-items-center rounded-full"
      style={{ background: `conic-gradient(${tone} ${score * 3.6}deg, rgb(28 37 65 / 0.12) 0)` }}>
      <div className="grid size-[4.9rem] place-items-center rounded-full bg-sheet">
        <span className="text-3xl font-extrabold">{score}</span>
      </div>
    </div>
  );
}

function SeoTab() {
  const { seo } = useBlog();
  if (!seo) return <p className="text-sm text-slate">Analysing your draft…</p>;
  const checks = [...seo.checks].sort((a, b) => a.pass - b.pass);
  const failing = checks.filter((c) => !c.pass).length;
  return (
    <div>
      <div className="flex items-center gap-4">
        <Dial score={seo.score} />
        <div className="text-sm">
          <p className="font-semibold">{failing ? `${failing} things to improve` : 'Ready to publish'}</p>
          <p className="mt-1 text-slate">{seo.stats.words} words · {seo.stats.headings} headings · keyword density {seo.stats.density}%</p>
        </div>
      </div>
      <ul className="mt-5 divide-y divide-ink/10">
        {checks.map((c) => (
          <li key={c.id} className="flex gap-3 py-2.5 text-sm">
            {c.pass
              ? <Check size={17} className="mt-0.5 shrink-0 text-pine" aria-label="Passed" />
              : <X size={17} className="mt-0.5 shrink-0 text-redpen" aria-label="Needs work" />}
            <div>
              <p className={c.pass ? 'text-slate' : 'font-semibold'}>{c.label}</p>
              {c.detail && <p className="text-slate">{c.detail}</p>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function GrammarTab() {
  const { grammar, checkGrammar, applyGrammar, busy, draft } = useBlog();
  return (
    <div>
      <p className="text-sm text-slate">The AI proofreads every block and lists its changes. Nothing changes in your draft until you apply them.</p>
      <button className="btn-ink mt-4 w-full" onClick={checkGrammar} disabled={busy === 'grammar' || !draft.blocks.length}>
        {busy === 'grammar' ? 'Proofreading…' : grammar ? 'Check again' : 'Check grammar'}
      </button>
      {grammar && grammar.issues.length === 0 && <p className="mt-4 text-sm font-semibold text-pine">No issues found. Your draft reads clean.</p>}
      {grammar && grammar.issues.length > 0 && (
        <>
          <ul className="mt-4 space-y-3">
            {grammar.issues.map((x, i) => (
              <li key={i} className="rounded-lg border border-ink/15 bg-white p-3 text-sm">
                <p className="font-copy text-base text-redpen line-through decoration-2">{x.original}</p>
                <p className="mt-1 font-copy text-base text-pine">{x.corrected}</p>
                <p className="mt-1.5 text-slate">{x.reason}</p>
              </li>
            ))}
          </ul>
          <button className="btn-marker mt-4 w-full" onClick={applyGrammar}>Apply all corrections</button>
        </>
      )}
    </div>
  );
}

function ExportTab() {
  const { draft, notify } = useBlog();
  const copy = async (text, label) => {
    try { await navigator.clipboard.writeText(text); notify(`${label} copied`); }
    catch { notify('Copy failed. Your browser blocked clipboard access.', 'error'); }
  };
  return (
    <div className="space-y-2.5">
      <p className="mb-3 text-sm text-slate">Take the finished article anywhere. Headings and paragraphs keep their structure.</p>
      <button className="btn-ghost w-full justify-start" onClick={() => copy(toMarkdown(draft), 'Markdown')}><Copy size={16} /> Copy as Markdown</button>
      <button className="btn-ghost w-full justify-start" onClick={() => copy(toHtml(draft), 'HTML')}><Copy size={16} /> Copy as HTML</button>
      <button className="btn-ghost w-full justify-start" onClick={() => download(draft, 'md')}><Download size={16} /> Download .md file</button>
      <button className="btn-ghost w-full justify-start" onClick={() => download(draft, 'html')}><Download size={16} /> Download .html page</button>
    </div>
  );
}

const tabs = [['seo', 'SEO', SeoTab], ['grammar', 'Grammar', GrammarTab], ['export', 'Export', ExportTab]];

export default function ProofPanel() {
  const [tab, setTab] = useState('seo');
  const Active = tabs.find((t) => t[0] === tab)[2];
  return (
    <aside className="rounded-xl border border-ink/20 bg-sheet lg:sticky lg:top-20">
      <div role="tablist" className="flex border-b border-ink/15">
        {tabs.map(([id, label]) => (
          <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)}
            className={`flex-1 px-3 py-3 text-sm font-semibold transition ${tab === id ? 'border-b-[3px] border-ink' : 'text-slate hover:text-ink'}`}>
            {label}
          </button>
        ))}
      </div>
      <div className="max-h-[calc(100vh-10rem)] overflow-y-auto p-5"><Active /></div>
    </aside>
  );
}
