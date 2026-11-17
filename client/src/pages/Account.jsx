import { useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { useBlog } from '../hooks/useBlog.js';

export default function Account() {
  const { user, changePassword } = useAuth();
  const { notify } = useBlog();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.newPassword.length < 8) return setError('New password must be at least 8 characters.');
    setLoading(true);
    try {
      await changePassword(form);
      setForm({ currentPassword: '', newPassword: '' });
      notify('Password updated');
    } catch (err) { setError(err.response?.data?.message || 'Could not update password.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-md">
      <h1 className="text-4xl font-extrabold tracking-tight">Account</h1>
      <p className="mt-1 text-slate">{user.name} · {user.email}</p>
      <form onSubmit={submit} className="mt-8 space-y-4 rounded-xl border border-ink/20 bg-sheet p-6">
        <h2 className="text-xl font-bold">Change password</h2>
        <div><label className="label" htmlFor="cur">Current password</label>
          <input id="cur" type="password" className="field" autoComplete="current-password" required value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} /></div>
        <div><label className="label" htmlFor="new">New password</label>
          <input id="new" type="password" className="field" autoComplete="new-password" required value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} />
          <p className="hint">At least 8 characters.</p></div>
        {error && <p role="alert" className="error">{error}</p>}
        <button className="btn-ink" disabled={loading}>{loading ? 'Updating…' : 'Update password'}</button>
      </form>
    </div>
  );
}
