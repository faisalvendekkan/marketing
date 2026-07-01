import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Bell, Sun, Moon, Search, LogOut, User as UserIcon, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useNotifications } from '@/hooks/useNotifications';
import { initials, formatDateTime } from '@/lib/utils';

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const { list, unread, markAll, markOne } = useNotifications();
  const [openNotif, setOpenNotif] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setOpenNotif(false);
      if (profRef.current && !profRef.current.contains(e.target as Node)) setOpenProfile(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const doLogout = async () => { await logout(); navigate('/login'); };
  const count = unread.data ?? 0;

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/80 px-4 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80 lg:px-6">
      <button onClick={onMenu} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden">
        <Menu className="h-5 w-5" />
      </button>

      <div className="relative hidden max-w-md flex-1 sm:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input placeholder="Search campaigns, leads, content…" className="input pl-9" />
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <button onClick={toggle} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Toggle theme">
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        <div className="relative" ref={notifRef}>
          <button onClick={() => setOpenNotif((v) => !v)} className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
            <Bell className="h-5 w-5" />
            {count > 0 && <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">{count}</span>}
          </button>
          {openNotif && (
            <div className="card absolute right-0 mt-2 w-80 p-0">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
                <p className="text-sm font-semibold">Notifications</p>
                <button onClick={() => markAll.mutate()} className="text-xs font-medium text-brand-600 hover:underline">Mark all read</button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {(list.data?.items ?? []).length === 0 && <p className="px-4 py-6 text-center text-sm text-slate-500">No notifications</p>}
                {list.data?.items.map((n) => (
                  <div key={n.id} className={`flex items-start gap-2 border-b border-slate-100 px-4 py-3 last:border-0 dark:border-slate-800 ${!n.is_read ? 'bg-brand-50/50 dark:bg-brand-500/5' : ''}`}>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{n.title}</p>
                      {n.body && <p className="text-xs text-slate-500">{n.body}</p>}
                      <p className="mt-0.5 text-[11px] text-slate-400">{formatDateTime(n.created_at)}</p>
                    </div>
                    {!n.is_read && <button onClick={() => markOne.mutate(n.id)} className="text-slate-400 hover:text-brand-600"><Check className="h-4 w-4" /></button>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={profRef}>
          <button onClick={() => setOpenProfile((v) => !v)} className="flex items-center gap-2 rounded-lg p-1 pl-1.5 hover:bg-slate-100 dark:hover:bg-slate-800">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
              {initials(`${user?.firstName} ${user?.lastName ?? ''}`)}
            </div>
            <span className="hidden text-sm font-medium sm:block">{user?.firstName}</span>
          </button>
          {openProfile && (
            <div className="card absolute right-0 mt-2 w-56 p-1.5">
              <div className="px-3 py-2">
                <p className="text-sm font-semibold">{user?.firstName} {user?.lastName}</p>
                <p className="truncate text-xs text-slate-500">{user?.email}</p>
                <p className="mt-1 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[11px] capitalize text-slate-600 dark:bg-slate-800 dark:text-slate-300">{user?.role?.replace(/_/g, ' ')}</p>
              </div>
              <div className="my-1 border-t border-slate-200 dark:border-slate-800" />
              <button onClick={() => { setOpenProfile(false); navigate('/app/profile'); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800">
                <UserIcon className="h-4 w-4" /> Profile
              </button>
              <button onClick={doLogout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10">
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
