import React from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { t } from './i18n';
import LandingPage from './pages/LandingPage';
import CoursesPage from './pages/CoursesPage';
import CourseDetailPage from './pages/CourseDetailPage';
import LessonPage from './pages/LessonPage';
import CommunityPage from './pages/CommunityPage';
import ProfilePage from './pages/ProfilePage';
import AuthPage from './pages/AuthPage';

function Layout({ children }) {
  const { session, locale, setLocale } = useAuth();
  return (
    <div className="app-shell">
      <nav>
        <div className="nav-left">
          <div className="nav-logo">
            <Link to="/">{t(locale, 'appName')}</Link>
          </div>
          <div className="nav-links">
            <Link to="/courses">{t(locale, 'courses')}</Link>
            <Link to="/community">{t(locale, 'community')}</Link>
          </div>
        </div>
        <div className="nav-right">
          <select
            value={locale}
            onChange={e => setLocale(e.target.value)}
            className="btn"
          >
            <option value="de">DE</option>
            <option value="en">EN</option>
          </select>
          {session ? (
            <>
              <Link to="/profile" className="btn">
                {t(locale, 'profile')}
              </Link>
            </>
          ) : (
            <Link to="/auth" className="btn">
              {t(locale, 'login')}
            </Link>
          )}
        </div>
      </nav>
      {children}
      <footer className="footer">
        © {new Date().getFullYear()} – IT Lernplattform MVP • Built with React, Supabase & Netlify
      </footer>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { session, loading } = useAuth();
  if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>;
  if (!session) return <Navigate to="/auth" replace />;
  return children;
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/courses/:slug" element={<CourseDetailPage />} />
        <Route
          path="/courses/:slug/lessons/:lessonId"
          element={
            <ProtectedRoute>
              <LessonPage />
            </ProtectedRoute>
          }
        />
        <Route path="/community" element={<CommunityPage />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Layout>
  );
}
