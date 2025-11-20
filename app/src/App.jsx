import React from "react";
import { Routes, Route, Navigate, Link } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { supabase } from "./supabaseClient";

// Lazy-loaded Seiten (Code-Splitting für bessere Performance)
const DashboardPage = React.lazy(() => import("./pages/DashboardPage"));
const CoursesPage = React.lazy(() => import("./pages/CoursesPage"));
const CourseDetailPage = React.lazy(() => import("./pages/CourseDetailPage"));
const LessonPage = React.lazy(() => import("./pages/LessonPage"));
const ProjectsPage = React.lazy(() => import("./pages/ProjectsPage"));
const CommunityPage = React.lazy(() => import("./pages/CommunityPage"));
const ProfilePage = React.lazy(() => import("./pages/ProfilePage"));
const AdminPanel = React.lazy(() => import("./pages/AdminPanel"));
const AuthPage = React.lazy(() => import("./pages/AuthPage"));
const LandingPage = React.lazy(() => import("./pages/LandingPage"));

/* -------------------------------------------
   Loader
------------------------------------------- */
function LoadingScreen() {
  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      Lade Plattform…
    </div>
  );
}

/* -------------------------------------------
   ProtectedRoute
------------------------------------------- */
function ProtectedRoute({ children }) {
  const { session, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!session) return <Navigate to="/auth" replace />;
  return children;
}

/* -------------------------------------------
   PublicRoute (nur für Gäste)
------------------------------------------- */
function PublicRoute({ children }) {
  const { session, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (session) return <Navigate to="/dashboard" replace />;
  return children;
}

/* -------------------------------------------
   Layout (Navbar + Footer + Theme)
------------------------------------------- */
function Layout({ children }) {
  const { session, locale, setLocale } = useAuth();
  const [theme, setTheme] = React.useState(() => {
    if (typeof window === "undefined") return "dark";
    return localStorage.getItem("theme") === "light" ? "light" : "dark";
  });

  React.useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.classList.toggle("theme-light", theme === "light");
    document.body.classList.toggle("theme-dark", theme === "dark");
    document.documentElement.style.setProperty(
      "color-scheme",
      theme === "light" ? "light" : "dark"
    );
    try {
      localStorage.setItem("theme", theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <div className="app-shell">
      {/* NAVBAR */}
      <nav>
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
            </div>
          )}
        </div>

        <div className="nav-right">
          <button
            type="button"
            className="icon-button"
            aria-label={theme === "dark" ? "Wechsel zu Light Mode" : "Wechsel zu Dark Mode"}
            onClick={toggleTheme}
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>

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
              <Link className="btn" to="/profile">
                Profil
              </Link>
              <button
                className="btn"
                onClick={async () => {
                  if (!supabase) return;
                  await supabase.auth.signOut();
                  window.location.href = "/";
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <Link className="btn" to="/auth">
              Login
            </Link>
          )}
        </div>
      </nav>

      {/* SEITENINHALT */}
      <React.Suspense fallback={<LoadingScreen />}>{children}</React.Suspense>

      {/* FOOTER */}
      <footer className="footer">
        © {new Date().getFullYear()} – IT Lernplattform
      </footer>
    </div>
  );
}

/* -------------------------------------------
   App-Komponente
------------------------------------------- */
function App() {
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
        <Route
          path="/auth"
          element={
            <PublicRoute>
              <AuthPage />
            </PublicRoute>
          }
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

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;
