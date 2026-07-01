import { useState } from 'react';
import { Link } from 'react-router-dom';
import api, { apiError } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { AuthShell } from './AuthShell';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function ForgotPassword() {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
      toast('success', 'If that email exists, a reset link is on its way.');
    } catch (err) {
      toast('error', apiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Reset password" subtitle="We’ll email you a link to reset your password.">
      {sent ? (
        <div className="card p-5 text-sm text-slate-600 dark:text-slate-300">
          Check your inbox for a reset link. It expires in 1 hour.
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Button type="submit" loading={loading} className="w-full">Send reset link</Button>
        </form>
      )}
      <p className="mt-6 text-center text-sm text-slate-500">
        <Link to="/login" className="font-semibold text-brand-600 hover:underline">Back to sign in</Link>
      </p>
    </AuthShell>
  );
}
