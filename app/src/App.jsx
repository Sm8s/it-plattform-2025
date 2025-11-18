import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

import ModernItPlatform from "./ModernItPlatform";
import CoursesPage from "./pages/CoursesPage";
import CourseDetailPage from "./pages/CourseDetailPage";
import LessonPage from "./pages/LessonPage";
import CommunityPage from "./pages/CommunityPage";
import ProfilePage from "./pages/ProfilePage";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import ProjectsPage from "./pages/ProjectsPage";
import AdminPanel from "./pages/AdminPanel";

function ProtectedRoute({ children }) {
  const { session, loading } = useAuth();
  if (loading) return <div style={{ padding: "2rem" }}>Loading…</div>;
  if (!session) return <Navigate to="/auth" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { session, loading } = useAuth();
  if (loading) return <div style={{ padding: "2rem" }}>Loading…</div>;
  if (session) return <Navigate to="/dashboard" replace />;
  return children;
}

function Layout({ children }) {
  const { session, locale, setLocale } = useAuth();

  return (
    <div>
      <nav className="nav">
        <div className="nav-logo">
          <a href={session ? "/dashboard" : "/"}>IT Lernplattform</a>
        </div>

        <div className="nav-right">
          <select
            value={locale}
            onChange={(e) => setLocale(e.target.value)}
            className="btn"
          >
            <option value="de">DE</option>
            <option value="en">EN</option>
          </select>

          {session ? (
            <>
              <a href="/profile" className="btn">Profil</a>
              <button
                className="btn"
                onClick={async () => {
                  await supabase.auth.signOut();
                  window.location.href = "/";
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <a href="/auth" className="btn">Login</a>
          )}
        </div>
      </nav>

      {children}

      <footer className="footer">
        © {new Date().getFullYear()} – IT Lernplattform
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <Layout>
      <Routes>

        {/* Landing page only for guests */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <ModernItPlatform />
            </PublicRoute>
          }
        />

        {/* Login / Register */}
        <Route
          path="/auth"
          element={<AuthPage />}
        />

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Courses */}
        <Route
          path="/courses"
          element={
            <ProtectedRoute>
              <CoursesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/courses/:slug"
          element={
            <ProtectedRoute>
              <CourseDetailPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/courses/:slug/lessons/:lessonId"
          element={
            <ProtectedRoute>
              <LessonPage />
            </ProtectedRoute>
          }
        />

        {/* Projekte */}
        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <ProjectsPage />
            </ProtectedRoute>
          }
        />

        {/* Community */}
        <Route
          path="/community"
          element={
            <ProtectedRoute>
              <CommunityPage />
            </ProtectedRoute>
          }
        />

        {/* Admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminPanel />
            </ProtectedRoute>
          }
        />

      </Routes>
    </Layout>
  );
}
