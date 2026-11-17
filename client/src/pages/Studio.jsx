import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useBlog } from '../hooks/useBlog.js';
import BlockEditor from '../components/BlockEditor.jsx';
import ProofPanel from '../components/ProofPanel.jsx';
import AutoTextarea from '../components/AutoTextarea.jsx';

const TONES = ['conversational', 'professional', 'friendly', 'authoritative', 'witty'];
const LENGTHS = [['short', 'Short · ~600 words'], ['medium', 'Medium · ~1,000'], ['long', 'Long · ~1,500']];

function Working({ title, note }) {
  return (
    <div role="status" className="mx-auto mt-24 max-w-md text-center">
      <div className="mx-auto mb-6 h-2 w-48 overflow-hidden rounded-full bg-ink/10"><div className="hl h-full w-1/2 animate-pulse !bg-marker" style={{ background: 'var(--color-marker)' }} /></div>
      <p className="text-2xl font-bold">{title}</p>
      <p className="mt-2 text-slate">{note}</p>
    </div>
  );
}

function BriefStep() {
  const { draft, setField, fetchHeadlines, generateDraft } = useBlog();
  const [errors, setErrors] = useState({});
  const validate = () => {
    const e = {};
    if (draft.topic.trim().length < 3) e.topic = 'Enter the topic you want to write about.';
    if (!draft.primaryKeyword.trim()) e.primaryKeyword = 'Enter the main keyword people will search for.';
    setErrors(e);
    return !Object.keys(e).length;
  };
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-4xl font-extrabold tracking-tight">What are we writing?</h1>
      <p className="mt-2 text-slate">Tell the AI the topic and the keyword you want to rank for. You can edit everything afterwards.</p>
      <div className="mt-8 space-y-5">
        <div><label className="label" htmlFor="topic">Blog topic</label>
          <input id="topic" className="field" placeholder="e.g. How to brew cold coffee at home" value={draft.topic} onChange={(e) => setField('topic', e.target.value)} />
          {errors.topic && <p className="error">{errors.topic}</p>}</div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div><label className="label" htmlFor="pk">Primary keyword</label>
            <input id="pk" className="field" placeholder="cold brew coffee" value={draft.primaryKeyword} onChange={(e) => setField('primaryKeyword', e.target.value)} />
            {errors.primaryKeyword && <p className="error">{errors.primaryKeyword}</p>}</div>
          <div><label className="label" htmlFor="sk">Secondary keywords <span className="font-normal text-slate">(optional)</span></label>
            <input id="sk" className="field" placeholder="coffee ratio, mason jar" value={draft.secondaryText} onChange={(e) => setField('secondaryText', e.target.value)} />
            <p className="hint">Separate with commas.</p></div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div><label className="label" htmlFor="tone">Tone</label>
            <select id="tone" className="field capitalize" value={draft.tone} onChange={(e) => setField('tone', e.target.value)}>
              {TONES.map((t) => <option key={t}>{t}</option>)}</select></div>
          <div><label className="label" htmlFor="len">Length</label>
            <select id="len" className="field" value={draft.length} onChange={(e) => setField('length', e.target.value)}>
              {LENGTHS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div>
        </div>
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <button className="btn-ink" onClick={() => validate() && fetchHeadlines()}>Suggest headlines</button>
        <button className="btn-ghost" onClick={() => validate() && generateDraft(draft.topic)}>Skip to the draft</button>
      </div>
    </div>
  );
}

function HeadlineStep() {
  const { headlines, generateDraft, setStep, draft, setField } = useBlog();
  const [custom, setCustom] = useState('');
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-4xl font-extrabold tracking-tight">Pick a headline</h1>
      <p className="mt-2 text-slate">The article is written around the one you choose. You can change it later in the editor.</p>
      <ul className="mt-8 space-y-2.5">
        {headlines.map((h, i) => (
          <li key={i}>
            <button onClick={() => { setField('title', h.title); generateDraft(h.title); }}
              className="group w-full rounded-xl border border-ink/20 bg-sheet p-4 text-left transition hover:border-ink hover:bg-marker/20">
              <span className="block text-lg font-bold">{h.title}</span>
              <span className="mt-0.5 block text-sm text-slate">{h.angle} · {h.title.length} characters</span>
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-6 flex gap-2">
        <input aria-label="Write your own headline" className="field" placeholder="Or write your own headline" value={custom} onChange={(e) => setCustom(e.target.value)} />
        <button className="btn-ink shrink-0" disabled={!custom.trim()} onClick={() => { setField('title', custom); generateDraft(custom); }}>Use it</button>
      </div>
      <button className="btn-ghost mt-6" onClick={() => setStep('brief')}>Back to brief</button>
    </div>
  );
}

function EditorStep() {
  const { draft, setField, save, busy, setStep, generateDraft } = useBlog();
  const navigate = useNavigate();
  const onSave = async () => {
    const saved = await save();
    if (saved && !draft.id) navigate(`/studio/${saved._id}`, { replace: true });
  };
  const confirmRewrite = () => { if (window.confirm('Write a new article from this brief? Your current edits will be replaced.')) generateDraft(draft.title); };
  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
      <div>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <button className="btn-ghost !py-2" onClick={() => setStep('brief')}>Edit brief</button>
          <button className="btn-ghost !py-2" onClick={confirmRewrite} disabled={!draft.topic}>Rewrite with AI</button>
          <button className="btn-marker ml-auto !py-2" onClick={onSave} disabled={busy === 'save'}>{busy === 'save' ? 'Saving…' : draft.id ? 'Save changes' : 'Save blog'}</button>
        </div>
        <article className="rounded-xl border border-ink/20 bg-sheet px-5 py-8 shadow-sm sm:px-10">
          <div className="pl-14">
            <AutoTextarea aria-label="Blog title" value={draft.title} onChange={(e) => setField('title', e.target.value)} placeholder="Blog title"
              className="w-full bg-transparent text-4xl font-extrabold leading-tight tracking-tight focus:outline-none" />
            <p className="mt-1 text-sm text-slate">{draft.title.length} characters · aim for 30–60</p>
            <label className="label mt-6" htmlFor="meta">Meta description</label>
            <AutoTextarea id="meta" value={draft.metaDescription} onChange={(e) => setField('metaDescription', e.target.value)}
              className="field !text-sm" placeholder="The summary that shows up in search results" />
            <p className="hint">{draft.metaDescription.length} characters · aim for 120–160</p>
          </div>
          <hr className="my-7 border-ink/15" />
          <BlockEditor />
        </article>
      </div>
      <ProofPanel />
    </div>
  );
}

export default function Studio() {
  const { id } = useParams();
  const { step, busy, load, reset, draft } = useBlog();

  useEffect(() => {
    if (id && draft.id !== id) load(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);
  useEffect(() => { if (!id) reset(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [id]);

  if (busy === 'generate') return <Working title="Drafting your article…" note="This usually takes 10–30 seconds. Keep this tab open." />;
  if (busy === 'headlines') return <Working title="Thinking up headlines…" note="A few seconds." />;
  if (busy === 'load') return <Working title="Opening your draft…" note="" />;
  if (step === 'headlines') return <HeadlineStep />;
  if (step === 'editor') return <EditorStep />;
  return <BriefStep />;
}
