import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { useBlog } from '../hooks/useBlog.js';
import { useAuth } from '../hooks/useAuth.js';

const fmt = (d) => new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
const scoreColor = (s) => (s >= 80 ? 'bg-pine' : s >= 50 ? 'bg-[#d99a00]' : 'bg-redpen');

export default function Dashboard() {
  const { blogs, loadBlogs, removeBlog, busy, reset } = useBlog();
  const { user } = useAuth();
  const navigate = useNavigate();
  useEffect(() => { loadBlogs(); }, [loadBlogs]);

  const confirmDelete = (b) => { if (window.confirm(`Delete "${b.title}"? This cannot be undone.`)) removeBlog(b._id); };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">{user.name.split(' ')[0]}’s blogs</h1>
          <p className="mt-1 text-slate">{blogs.length} saved {blogs.length === 1 ? 'draft' : 'drafts'}</p>
        </div>
        <Link to="/studio" onClick={reset} className="btn-marker">Write a new blog</Link>
      </div>

      {busy === 'list' && !blogs.length && <p className="mt-10 text-slate">Loading your blogs…</p>}

      {busy !== 'list' && !blogs.length && (
        <div className="mt-10 rounded-xl border-2 border-dashed border-ink/25 p-12 text-center">
          <p className="text-xl font-bold">Nothing here yet</p>
          <p className="mx-auto mt-2 max-w-sm text-slate">Enter a topic and a keyword, and your first article will be ready in under a minute.</p>
          <Link to="/studio" className="btn-ink mt-6">Start your first blog</Link>
        </div>
      )}

      {blogs.length > 0 && (
        <ul className="mt-8 divide-y divide-ink/15 rounded-xl border border-ink/20 bg-sheet">
          {blogs.map((b) => (
            <li key={b._id} className="flex flex-wrap items-center gap-x-6 gap-y-3 p-5">
              <button onClick={() => navigate(`/studio/${b._id}`)} className="min-w-0 flex-1 basis-72 text-left">
                <p className="truncate text-lg font-bold hover:underline">{b.title}</p>
                <p className="mt-0.5 truncate text-sm text-slate">
                  {b.primaryKeyword ? `Keyword: ${b.primaryKeyword}` : 'No keyword'} · {b.wordCount} words · Edited {fmt(b.updatedAt)}
                </p>
              </button>
              <div className="w-32" title={`SEO score ${b.seoScore} of 100`}>
                <p className="text-xs font-semibold text-slate">SEO {b.seoScore}/100</p>
                <div className="mt-1 h-2 rounded-full bg-ink/10"><div className={`h-2 rounded-full ${scoreColor(b.seoScore)}`} style={{ width: `${b.seoScore}%` }} /></div>
              </div>
              <div className="flex gap-2">
                <button className="btn-ghost !py-2" onClick={() => navigate(`/studio/${b._id}`)}>Edit</button>
                <button className="btn-ghost !px-3 !py-2 hover:!border-redpen hover:!text-redpen" aria-label={`Delete ${b.title}`} onClick={() => confirmDelete(b)}><Trash2 size={16} /></button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
