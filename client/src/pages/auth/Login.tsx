import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { apiError } from '@/lib/api';
import { AuthShell } from './AuthShell';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation() as { state?: { from?: string } };
  const [email, setEmail] = useState('admin@abilix.ai');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password, remember);
      toast('success', 'Welcome back!');
      navigate(location.state?.from ?? '/app', { replace: true });
    } catch (err) {
      toast('error', apiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Sign in" subtitle="Welcome back — enter your details to continue.">
      <form onSubmit={submit} className="space-y-4">
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="rounded border-slate-300" />
            Remember me
          </label>
          <Link to="/forgot-password" className="font-medium text-brand-600 hover:underline">Forgot password?</Link>
        </div>
        <Button type="submit" loading={loading} className="w-full">Sign in</Button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        Don’t have an account? <Link to="/register" className="font-semibold text-brand-600 hover:underline">Create one</Link>
      </p>
      <p className="mt-4 rounded-xl bg-slate-100 px-3 py-2 text-center text-xs text-slate-500 dark:bg-slate-800">
        Demo: admin@abilix.ai / Admin@12345
      </p>
    </AuthShell>
  );
}
