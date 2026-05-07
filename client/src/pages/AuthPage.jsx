import { CheckCircle2, LogIn, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useAsync } from '../hooks/useAsync.js';

const emptyForm = {
  name: '',
  email: '',
  password: '',
  role: 'Member'
};

export default function AuthPage() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState(emptyForm);
  const { login, signup } = useAuth();
  const { loading, error, setError, run } = useAsync();

  const isSignup = mode === 'signup';

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();

    await run(async () => {
      if (isSignup) {
        await signup(form);
      } else {
        await login({ email: form.email, password: form.password });
      }
    });
  }

  function switchMode(nextMode) {
    setMode(nextMode);
    setError('');
  }

  return (
    <main className="min-h-screen bg-stone-50">
      <section className="mx-auto grid min-h-screen max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="space-y-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">CollabTrack</p>
            <h1 className="mt-3 max-w-2xl text-4xl font-bold leading-tight text-slate-950 sm:text-5xl">
              Run projects, assign work, and keep progress visible.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
              A focused workspace for admins and contributors with secure access, project membership, and task progress in one place.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {['JWT sessions', 'Role controls', 'Live dashboards'].map((item) => (
              <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm" key={item}>
                <CheckCircle2 className="h-4 w-4 text-teal-600" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="panel p-6 sm:p-8">
          <div className="mb-6 grid grid-cols-2 rounded-md bg-slate-100 p-1">
            <button className={`segmented ${!isSignup ? 'segmented-active' : ''}`} onClick={() => switchMode('login')} type="button">
              <LogIn className="h-4 w-4" />
              Login
            </button>
            <button className={`segmented ${isSignup ? 'segmented-active' : ''}`} onClick={() => switchMode('signup')} type="button">
              <UserPlus className="h-4 w-4" />
              Signup
            </button>
          </div>

          <form className="space-y-4" onSubmit={submit}>
            {isSignup && (
              <label className="field">
                <span>Name</span>
                <input autoComplete="name" name="name" onChange={updateField} required type="text" value={form.name} />
              </label>
            )}

            <label className="field">
              <span>Email</span>
              <input autoComplete="email" name="email" onChange={updateField} required type="email" value={form.email} />
            </label>

            <label className="field">
              <span>Password</span>
              <input autoComplete={isSignup ? 'new-password' : 'current-password'} minLength={8} name="password" onChange={updateField} required type="password" value={form.password} />
            </label>

            {isSignup && (
              <label className="field">
                <span>Role</span>
                <select name="role" onChange={updateField} value={form.role}>
                  <option>Member</option>
                  <option>Admin</option>
                </select>
              </label>
            )}

            {error && <p className="alert">{error}</p>}

            <button className="primary-btn w-full" disabled={loading} type="submit">
              {loading ? 'Working...' : isSignup ? 'Create account' : 'Login'}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
