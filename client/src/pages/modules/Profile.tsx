import { useState } from 'react';
import api, { apiError } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardHeader } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { initials } from '@/lib/utils';

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const toast = useToast();
  const [profile, setProfile] = useState({ firstName: user?.firstName ?? '', lastName: user?.lastName ?? '' });
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '' });
  const [savingP, setSavingP] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  const saveProfile = async () => {
    setSavingP(true);
    try { await api.patch('/auth/me', profile); await refreshUser(); toast('success', 'Profile updated'); }
    catch (e) { toast('error', apiError(e)); } finally { setSavingP(false); }
  };
  const changePw = async () => {
    setSavingPw(true);
    try { await api.post('/auth/change-password', pw); setPw({ currentPassword: '', newPassword: '' }); toast('success', 'Password changed'); }
    catch (e) { toast('error', apiError(e)); } finally { setSavingPw(false); }
  };

  return (
    <div>
      <PageHeader title="My Profile" subtitle="Manage your personal information and security" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand-600 text-2xl font-bold text-white">
            {initials(`${user?.firstName} ${user?.lastName ?? ''}`)}
          </div>
          <h3 className="mt-3 font-semibold">{user?.firstName} {user?.lastName}</h3>
          <p className="text-sm text-slate-500">{user?.email}</p>
          <p className="mt-2 inline-block rounded-full bg-slate-100 px-3 py-1 text-xs capitalize dark:bg-slate-800">{user?.role?.replace(/_/g, ' ')}</p>
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader title="Personal Information" />
            <div className="grid grid-cols-2 gap-3">
              <Input label="First name" value={profile.firstName} onChange={(e) => setProfile({ ...profile, firstName: e.target.value })} />
              <Input label="Last name" value={profile.lastName} onChange={(e) => setProfile({ ...profile, lastName: e.target.value })} />
            </div>
            <div className="mt-4"><Button onClick={saveProfile} loading={savingP}>Save changes</Button></div>
          </Card>
          <Card>
            <CardHeader title="Change Password" />
            <div className="space-y-3">
              <Input label="Current password" type="password" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} />
              <Input label="New password" type="password" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} />
            </div>
            <div className="mt-4"><Button onClick={changePw} loading={savingPw}>Update password</Button></div>
          </Card>
        </div>
      </div>
    </div>
  );
}
