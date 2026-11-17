import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { Logo } from '../components/AppShell.jsx';

function CopyDeskSample() {
  return (
    <div className="relative rounded-xl bg-sheet p-7 text-ink shadow-2xl shadow-black/30">
      <p className="text-sm font-semibold text-slate">Draft: how to brew cold coffee at home</p>
      <p className="mt-4 font-copy text-xl leading-9">
        Making <span className="hl">cold brew coffee</span> at home takes <s className="pen-write text-redpen decoration-2">alot of</s>{' '}
        <span className="font-semibold text-pine">a lot of</span> patience, but very little skill. Steep coarse grounds in cold water for twelve hours, then strain.
      </p>
      <div className="mt-6 flex flex-wrap gap-2 text-sm font-semibold">
        <span className="rounded-full bg-pine/15 px-3 py-1 text-pine">Keyword in first paragraph</span>
        <span className="rounded-full bg-redpen/10 px-3 py-1 text-redpen">Meta description too short</span>
        <span className="rounded-full bg-ink/10 px-3 py-1">SEO 72</span>
      </div>
    </div>
  );
}

export default function AuthPage({ mode }) {
  const isRegister = mode === 'register';
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (isRegister && form.password.length < 8) return setError('Password must be at least 8 characters.');
    setLoading(true);
    try {
      await (isRegister ? register(form) : login(form));
      navigate(location.state?.from?.pathname || '/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Could not reach the server. Is the API running?');
    } finally { setLoading(false); }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <section className="hidden flex-col justify-between bg-ink p-12 text-white lg:flex">
        <Logo className="text-2xl" />
        <div className="max-w-xl">
          <h1 className="text-5xl font-extrabold leading-[1.05] tracking-tight">Give the AI the first draft. Keep the last word.</h1>
          <p className="mt-5 max-w-md text-lg text-white/75">Marginalia writes the article from your keywords, then marks it up like a copy editor so you can fix what matters.</p>
          <div className="mt-10"><CopyDeskSample /></div>
        </div>
        <p className="text-sm text-white/50">Headlines, draft, grammar and SEO in one desk.</p>
      </section>

      <section className="flex items-center justify-center px-6 py-12">
        <form onSubmit={submit} className="w-full max-w-sm" noValidate>
          <Logo className="mb-8 block text-2xl lg:hidden" />
          <h2 className="text-3xl font-extrabold tracking-tight">{isRegister ? 'Create your account' : 'Welcome back'}</h2>
          <p className="mt-2 text-slate">{isRegister ? 'Save every draft and pick up where you left off.' : 'Sign in to open your drafts.'}</p>
          <div className="mt-8 space-y-4">
            {isRegister && (
              <div><label className="label" htmlFor="name">Name</label>
                <input id="name" className="field" autoComplete="name" required value={form.name} onChange={set('name')} /></div>
            )}
            <div><label className="label" htmlFor="email">Email</label>
              <input id="email" type="email" className="field" autoComplete="email" required value={form.email} onChange={set('email')} /></div>
            <div><label className="label" htmlFor="password">Password</label>
              <input id="password" type="password" className="field" autoComplete={isRegister ? 'new-password' : 'current-password'} required value={form.password} onChange={set('password')} />
              {isRegister && <p className="hint">At least 8 characters.</p>}</div>
          </div>
          {error && <p role="alert" className="error">{error}</p>}
          <button className="btn-ink mt-6 w-full" disabled={loading}>{loading ? 'One moment…' : isRegister ? 'Create account' : 'Sign in'}</button>
          <p className="mt-6 text-sm text-slate">
            {isRegister ? 'Already have an account?' : 'New here?'}{' '}
            <Link className="font-semibold text-ink underline underline-offset-4" to={isRegister ? '/login' : '/register'}>
              {isRegister ? 'Sign in' : 'Create an account'}
            </Link>
          </p>
        </form>
      </section>
    </div>
  );
}
