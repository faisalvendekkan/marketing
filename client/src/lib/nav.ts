import {
  LayoutDashboard, Megaphone, Sparkles, Image, Video, CalendarDays, Search,
  MapPin, Mail, MessageCircle, Workflow, BarChart3, FileText, Users, Settings,
  Target, Contact,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  roles?: string[];   // if set, only these roles see it
  group: string;
}

export const NAV: NavItem[] = [
  { label: 'Dashboard', to: '/app', icon: LayoutDashboard, group: 'Overview' },
  { label: 'Campaigns', to: '/app/campaigns', icon: Megaphone, group: 'Marketing' },
  { label: 'Content Calendar', to: '/app/calendar', icon: CalendarDays, group: 'Marketing' },
  { label: 'Leads', to: '/app/leads', icon: Contact, group: 'Marketing' },
  { label: 'Tasks', to: '/app/tasks', icon: Target, group: 'Marketing' },
  { label: 'AI Content', to: '/app/ai-content', icon: Sparkles, group: 'AI Studio' },
  { label: 'AI Image', to: '/app/ai-image', icon: Image, group: 'AI Studio' },
  { label: 'AI Video', to: '/app/ai-video', icon: Video, group: 'AI Studio' },
  { label: 'SEO', to: '/app/seo', icon: Search, group: 'Growth' },
  { label: 'Google Business', to: '/app/google-business', icon: MapPin, group: 'Growth' },
  { label: 'Email', to: '/app/email', icon: Mail, group: 'Growth' },
  { label: 'WhatsApp', to: '/app/whatsapp', icon: MessageCircle, group: 'Growth' },
  { label: 'Automation', to: '/app/automation', icon: Workflow, group: 'Growth' },
  { label: 'Analytics', to: '/app/analytics', icon: BarChart3, group: 'Insights' },
  { label: 'Reports', to: '/app/reports', icon: FileText, group: 'Insights' },
  { label: 'Users', to: '/app/users', icon: Users, group: 'Admin', roles: ['super_admin', 'admin'] },
  { label: 'Settings', to: '/app/settings', icon: Settings, group: 'Admin' },
];

export const NAV_GROUPS = ['Overview', 'Marketing', 'AI Studio', 'Growth', 'Insights', 'Admin'];
