import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ToastProvider } from '@/context/ToastContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { PageLoader } from '@/components/ui/Spinner';

// Auth pages
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import ResetPassword from '@/pages/auth/ResetPassword';
import VerifyEmail from '@/pages/auth/VerifyEmail';
import NotFound from '@/pages/NotFound';

// App pages (lazy for bundle splitting)
const Dashboard = lazy(() => import('@/pages/dashboard/Dashboard'));
const Campaigns = lazy(() => import('@/pages/modules/Campaigns'));
const Leads = lazy(() => import('@/pages/modules/Leads'));
const SocialPosts = lazy(() => import('@/pages/modules/SocialPosts'));
const Tasks = lazy(() => import('@/pages/modules/Tasks'));
const AIContent = lazy(() => import('@/pages/modules/AIContent'));
const AIImage = lazy(() => import('@/pages/modules/AIImage'));
const AIVideo = lazy(() => import('@/pages/modules/AIVideo'));
const SEO = lazy(() => import('@/pages/modules/SEO'));
const GoogleBusiness = lazy(() => import('@/pages/modules/GoogleBusiness'));
const Email = lazy(() => import('@/pages/modules/Email'));
const WhatsApp = lazy(() => import('@/pages/modules/WhatsApp'));
const Automation = lazy(() => import('@/pages/modules/Automation'));
const Analytics = lazy(() => import('@/pages/modules/Analytics'));
const Reports = lazy(() => import('@/pages/modules/Reports'));
const Users = lazy(() => import('@/pages/modules/Users'));
const Settings = lazy(() => import('@/pages/modules/Settings'));
const Profile = lazy(() => import('@/pages/modules/Profile'));

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/verify-email" element={<VerifyEmail />} />

              <Route element={<ProtectedRoute />}>
                <Route path="/app" element={<DashboardLayout />}>
                  <Route index element={<Suspense fallback={<PageLoader />}><Dashboard /></Suspense>} />
                  <Route path="campaigns" element={<Suspense fallback={<PageLoader />}><Campaigns /></Suspense>} />
                  <Route path="calendar" element={<Suspense fallback={<PageLoader />}><SocialPosts /></Suspense>} />
                  <Route path="leads" element={<Suspense fallback={<PageLoader />}><Leads /></Suspense>} />
                  <Route path="tasks" element={<Suspense fallback={<PageLoader />}><Tasks /></Suspense>} />
                  <Route path="ai-content" element={<Suspense fallback={<PageLoader />}><AIContent /></Suspense>} />
                  <Route path="ai-image" element={<Suspense fallback={<PageLoader />}><AIImage /></Suspense>} />
                  <Route path="ai-video" element={<Suspense fallback={<PageLoader />}><AIVideo /></Suspense>} />
                  <Route path="seo" element={<Suspense fallback={<PageLoader />}><SEO /></Suspense>} />
                  <Route path="google-business" element={<Suspense fallback={<PageLoader />}><GoogleBusiness /></Suspense>} />
                  <Route path="email" element={<Suspense fallback={<PageLoader />}><Email /></Suspense>} />
                  <Route path="whatsapp" element={<Suspense fallback={<PageLoader />}><WhatsApp /></Suspense>} />
                  <Route path="automation" element={<Suspense fallback={<PageLoader />}><Automation /></Suspense>} />
                  <Route path="analytics" element={<Suspense fallback={<PageLoader />}><Analytics /></Suspense>} />
                  <Route path="reports" element={<Suspense fallback={<PageLoader />}><Reports /></Suspense>} />
                  <Route path="users" element={<Suspense fallback={<PageLoader />}><Users /></Suspense>} />
                  <Route path="settings" element={<Suspense fallback={<PageLoader />}><Settings /></Suspense>} />
                  <Route path="profile" element={<Suspense fallback={<PageLoader />}><Profile /></Suspense>} />
                </Route>
              </Route>

              <Route path="/" element={<Navigate to="/app" replace />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  );
}
