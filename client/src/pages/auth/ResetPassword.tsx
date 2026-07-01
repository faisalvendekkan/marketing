import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import api, { apiError } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { AuthShell } from './AuthShell';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const toast = useToast();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return toast('error', 'Invalid or missing reset token');
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      toast('success', 'Password reset. Please sign in.');
      navigate('/login');
    } catch (err) {
      toast('error', apiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Set new password" subtitle="Choose a strong password you’ll remember.">
      <form onSubmit={submit} className="space-y-4">
        <Input label="New password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
        <Button type="submit" loading={loading} className="w-full">Reset password</Button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        <Link to="/login" className="font-semibold text-brand-600 hover:underline">Back to sign in</Link>
      </p>
    </AuthShell>
  );
}
