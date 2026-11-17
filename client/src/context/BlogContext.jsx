import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { aiApi, blogApi } from '../api/services.js';
import { useAuth } from '../hooks/useAuth.js';

export const BlogContext = createContext(null);

const emptyDraft = {
  id: null, title: '', topic: '', primaryKeyword: '', secondaryText: '',
  tone: 'conversational', length: 'medium', metaDescription: '', blocks: [],
};
const uid = () => crypto.randomUUID();
const kwList = (d) => d.secondaryText.split(',').map((s) => s.trim()).filter(Boolean);
const errText = (e) => e.response?.data?.message || 'Something went wrong. Try again.';

export function BlogProvider({ children }) {
  const { user } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [draft, setDraft] = useState(emptyDraft);
  const [step, setStep] = useState('brief'); // brief | headlines | editor
  const [headlines, setHeadlines] = useState([]);
  const [grammar, setGrammar] = useState(null);
  const [seo, setSeo] = useState(null);
  const [busy, setBusy] = useState(null);
  const [toast, setToast] = useState(null);

  const notify = useCallback((text, type = 'ok') => {
    setToast({ text, type, key: Date.now() });
  }, []);
  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const reset = useCallback(() => {
    setDraft(emptyDraft); setStep('brief'); setHeadlines([]); setGrammar(null); setSeo(null);
  }, []);
  useEffect(() => { if (!user) { reset(); setBlogs([]); } }, [user, reset]);

  const run = useCallback(async (label, fn) => {
    setBusy(label);
    try { return await fn(); }
    catch (e) { notify(errText(e), 'error'); return null; }
    finally { setBusy(null); }
  }, [notify]);

  const setField = useCallback((name, value) => setDraft((d) => ({ ...d, [name]: value })), []);

  // ---- blocks -------------------------------------------------------------
  const updateBlock = useCallback((id, patch) => {
    setDraft((d) => ({ ...d, blocks: d.blocks.map((b) => (b.id === id ? { ...b, ...patch } : b)) }));
  }, []);
  const addBlock = useCallback((afterId, type = 'p') => {
    setDraft((d) => {
      const blocks = [...d.blocks];
      const i = afterId ? blocks.findIndex((b) => b.id === afterId) + 1 : blocks.length;
      blocks.splice(i, 0, { id: uid(), type, text: '' });
      return { ...d, blocks };
    });
  }, []);
  const removeBlock = useCallback((id) => setDraft((d) => ({ ...d, blocks: d.blocks.filter((b) => b.id !== id) })), []);
  const moveBlock = useCallback((id, dir) => {
    setDraft((d) => {
      const blocks = [...d.blocks];
      const i = blocks.findIndex((b) => b.id === id);
      const j = i + dir;
      if (j < 0 || j >= blocks.length) return d;
      [blocks[i], blocks[j]] = [blocks[j], blocks[i]];
      return { ...d, blocks };
    });
  }, []);

  // ---- AI actions ---------------------------------------------------------
  const brief = (d) => ({
    topic: d.topic, primaryKeyword: d.primaryKeyword, secondaryKeywords: kwList(d), tone: d.tone, length: d.length,
  });

  const fetchHeadlines = useCallback(() => run('headlines', async () => {
    const list = await aiApi.headlines(brief(draft));
    setHeadlines(list); setStep('headlines');
  }), [draft, run]);

  const generateDraft = useCallback((title) => run('generate', async () => {
    const out = await aiApi.generate({ ...brief(draft), title: title || draft.title || draft.topic });
    setDraft((d) => ({ ...d, title: out.title, metaDescription: out.metaDescription, blocks: out.blocks }));
    setGrammar(null); setStep('editor');
  }), [draft, run]);

  const checkGrammar = useCallback(() => run('grammar', async () => {
    const out = await aiApi.grammar(draft.blocks);
    setGrammar(out);
    notify(out.issues.length ? `${out.issues.length} suggestions to review` : 'No grammar issues found');
  }), [draft.blocks, run, notify]);

  const applyGrammar = useCallback(() => {
    if (!grammar) return;
    const fixed = new Map(grammar.blocks.map((b) => [b.id, b.text]));
    setDraft((d) => ({ ...d, blocks: d.blocks.map((b) => (fixed.has(b.id) ? { ...b, text: fixed.get(b.id) } : b)) }));
    setGrammar(null);
    notify('Corrections applied');
  }, [grammar, notify]);

  // Live SEO analysis, debounced while editing.
  useEffect(() => {
    if (step !== 'editor' || !draft.blocks.length) return undefined;
    const t = setTimeout(() => {
      aiApi.seo({
        title: draft.title, metaDescription: draft.metaDescription, blocks: draft.blocks,
        primaryKeyword: draft.primaryKeyword, secondaryKeywords: kwList(draft),
      }).then(setSeo).catch(() => {});
    }, 700);
    return () => clearTimeout(t);
  }, [step, draft]);

  // ---- persistence --------------------------------------------------------
  const save = useCallback(() => run('save', async () => {
    const body = { ...draft, secondaryKeywords: kwList(draft) };
    const saved = draft.id ? await blogApi.update(draft.id, body) : await blogApi.create(body);
    setDraft((d) => ({ ...d, id: saved._id }));
    notify('Saved to your blogs');
    return saved;
  }), [draft, run, notify]);

  const load = useCallback((id) => run('load', async () => {
    const b = await blogApi.get(id);
    setDraft({
      id: b._id, title: b.title, topic: b.topic, primaryKeyword: b.primaryKeyword,
      secondaryText: (b.secondaryKeywords || []).join(', '), tone: b.tone, length: 'medium',
      metaDescription: b.metaDescription, blocks: b.blocks.map((x) => ({ ...x, id: x.id || uid() })),
    });
    setGrammar(null); setStep('editor');
  }), [run]);

  const loadBlogs = useCallback(() => run('list', async () => setBlogs(await blogApi.list())), [run]);
  const removeBlog = useCallback((id) => run('delete', async () => {
    await blogApi.remove(id);
    setBlogs((list) => list.filter((b) => b._id !== id));
    notify('Blog deleted');
  }), [run, notify]);

  const value = useMemo(() => ({
    blogs, draft, step, setStep, headlines, grammar, seo, busy, toast,
    setField, updateBlock, addBlock, removeBlock, moveBlock,
    fetchHeadlines, generateDraft, checkGrammar, applyGrammar,
    save, load, loadBlogs, removeBlog, reset, notify,
  }), [blogs, draft, step, headlines, grammar, seo, busy, toast, setField, updateBlock, addBlock, removeBlock,
    moveBlock, fetchHeadlines, generateDraft, checkGrammar, applyGrammar, save, load, loadBlogs, removeBlog, reset, notify]);

  return <BlogContext.Provider value={value}>{children}</BlogContext.Provider>;
}
