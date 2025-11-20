import React from "react";
import { Routes, Route, Navigate, Link } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { supabase } from "./supabaseClient";

import ModernItPlatform from "./ModernItPlatform";
import DashboardPage from "./pages/DashboardPage";
import CoursesPage from "./pages/CoursesPage";
import CourseDetailPage from "./pages/CourseDetailPage";
import LessonPage from "./pages/LessonPage";
import ProjectsPage from "./pages/ProjectsPage";
import CommunityPage from "./pages/CommunityPage";
import ProfilePage from "./pages/ProfilePage";
import AdminPanel from "./pages/AdminPanel";
import AuthPage from "./pages/AuthPage";
import LandingPage from "./pages/LandingPage";

/* -------------------------------------------
   ProtectedRoute
------------------------------------------- */
function ProtectedRoute({ children }) {
  const { session, loading } = useAuth();
  if (loading) return <div style={{ padding: "2rem" }}>Loading…</div>;
  if (!session) return <Navigate to="/auth" replace />;
  return children;
}

/* -------------------------------------------
   PublicRoute (nur für Gäste)
------------------------------------------- */
function PublicRoute({ children }) {
  const { session, loading } = useAuth();
  if (loading) return <div style={{ padding: "2rem" }}>Loading…</div>;
  if (session) return <Navigate to="/dashboard" replace />;
  return children;
}

/* -------------------------------------------
   Layout (Navbar + Footer)
------------------------------------------- */
function Layout({ children }) {
  const { session, locale, setLocale } = useAuth();

  return (
    <div>
      {/* NAV */}
      <nav className="nav">
        <div className="nav-left">
          <div className="nav-logo">
            <Link to={session ? "/dashboard" : "/"}>IT Lernplattform</Link>
          </div>

          {session && (
            <div className="nav-links">
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/courses">Kurse</Link>
              <Link to="/projects">Projekte</Link>
              <Link to="/community">Community</Link>
              {session?.user?.user_metadata?.is_owner && (
                <Link to="/admin">Admin</Link>
              )}
            </div>
          )}
        </div>

        <div className="nav-right">
          <select
            className="btn"
            value={locale}
            onChange={(e) => setLocale(e.target.value)}
          >
            <option value="de">DE</option>
            <option value="en">EN</option>
          </select>

          {session ? (
            <>
              <Link className="btn" to="/profile">Profil</Link>
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
            <Link className="btn" to="/auth">Login</Link>
          )}
        </div>
      </nav>

      {/* PAGE CONTENT */}
      {children}

      <footer className="footer">
        © {new Date().getFullYear()} – IT Lernplattform
      </footer>
    </div>
  );
}

/* -------------------------------------------
   App-Komponente
------------------------------------------- */
export default function App() {
  return (
    <Layout>
      <Routes>

        {/* Landing nur für Gäste */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <LandingPage />
            </PublicRoute>
          }
        />

        {/* Login */}
        <Route path="/auth" element={<AuthPage />} />

        {/* Dashboard für eingeloggte User */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Kurse */}
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

        {/* Profil */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
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
