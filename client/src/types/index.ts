export interface User {
  id: number;
  companyId: number | null;
  role: string;
  firstName: string;
  lastName: string | null;
  email: string;
  avatarUrl: string | null;
  emailVerified: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface DashboardData {
  stats: {
    campaigns: { total: number; active: number };
    leads: { total: number; won: number; pipelineValue: number };
    posts: { total: number; scheduled: number };
    tasks: { total: number; open: number };
    budget: { spent: number; total: number };
  };
  timeseries: { date: string; traffic: number; conversions: number }[];
  funnel: { status: string; count: number }[];
  sources: { source: string; count: number }[];
  campaigns: { id: number; name: string; status: string; budget: number; spent: number; budget_used: number }[];
  upcoming: { id: number; title: string | null; platform: string; status: string; scheduled_at: string | null }[];
  activity: { id: number; action: string; description: string | null; entity_type: string | null; created_at: string; user_name: string | null }[];
  taskSummary: { todo: number; in_progress: number; review: number; done: number };
}

export interface Campaign {
  id: number; name: string; description: string | null; objective: string | null;
  status: string; budget: number; spent: number; start_date: string | null; end_date: string | null; created_at: string;
}

export interface Lead {
  id: number; full_name: string; email: string | null; phone: string | null;
  company_name: string | null; value: number; status: string; created_at: string;
}

export interface Post {
  id: number; title: string | null; body: string | null; platform: string; status: string; created_at: string;
}

export interface Notification {
  id: number; title: string; body: string | null; type: string; link: string | null; is_read: number; created_at: string;
}
