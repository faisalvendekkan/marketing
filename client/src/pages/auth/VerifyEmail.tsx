import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api, { apiError } from '@/lib/api';
import { AuthShell } from './AuthShell';
import { Spinner } from '@/components/ui/Spinner';

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const [state, setState] = useState<'loading' | 'ok' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = params.get('token');
    if (!token) { setState('error'); setMessage('Missing verification token'); return; }
    api.post('/auth/verify-email', { token })
      .then(() => setState('ok'))
      .catch((err) => { setState('error'); setMessage(apiError(err)); });
  }, [params]);

  return (
    <AuthShell title="Email verification" subtitle="Confirming your email address.">
      <div className="card p-6 text-center">
        {state === 'loading' && <Spinner className="mx-auto h-6 w-6 text-brand-600" />}
        {state === 'ok' && <p className="text-sm text-emerald-600">Your email has been verified. You can now use all features.</p>}
        {state === 'error' && <p className="text-sm text-red-600">{message}</p>}
        <p className="mt-4 text-sm"><Link to="/login" className="font-semibold text-brand-600 hover:underline">Continue to sign in</Link></p>
      </div>
    </AuthShell>
  );
}
