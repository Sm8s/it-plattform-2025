import React, { useState, useEffect } from "react";
import {
  Home,
  Users,
  BookOpen,
  BarChart3,
  Shield,
  MessageCircle,
  User,
  LogOut,
  Sun,
  Moon,
  Eye,
  EyeOff,
  CheckCircle,
  Award,
  Rocket,
  Flame,
  Trophy,
  Code,
} from "lucide-react";
import { supabase } from "./supabaseClient";

const colorMap = {
  blue: { bg: "bg-blue-500/10", text: "text-blue-400" },
  yellow: { bg: "bg-yellow-500/10", text: "text-yellow-400" },
  purple: { bg: "bg-purple-500/10", text: "text-purple-400" },
  green: { bg: "bg-emerald-500/10", text: "text-emerald-400" },
  cyan: { bg: "bg-cyan-500/10", text: "text-cyan-400" },
  pink: { bg: "bg-pink-500/10", text: "text-pink-400" },
};

const ModernItPlatform = () => {
  const [currentPage, setCurrentPage] = useState("landing"); // "landing" | "learn" | "admin"
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);

  const courses = [
    {
      id: 1,
      title: "Python Grundlagen",
      color: "blue",
      level: "Anfänger",
      lessons: 24,
      xp: 500,
      progress: 45,
    },
    {
      id: 2,
      title: "JavaScript Basics",
      color: "yellow",
      level: "Anfänger",
      lessons: 18,
      xp: 400,
      progress: 20,
    },
    {
      id: 3,
      title: "Web Development",
      color: "purple",
      level: "Fortgeschritten",
      lessons: 32,
      xp: 800,
      progress: 0,
    },
    {
      id: 4,
      title: "Datenbanken & SQL",
      color: "green",
      level: "Fortgeschritten",
      lessons: 28,
      xp: 700,
      progress: 0,
    },
    {
      id: 5,
      title: "React Framework",
      color: "cyan",
      level: "Experte",
      lessons: 40,
      xp: 1000,
      progress: 0,
    },
    {
      id: 6,
      title: "Algorithmen",
      color: "pink",
      level: "Experte",
      lessons: 45,
      xp: 1200,
      progress: 0,
    },
  ];

  // Rolle aus user_roles / roles holen
  const fetchUserRole = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("roles ( key )")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        console.error("Fehler beim Laden der Rolle:", error.message);
        return null;
      }
      return data?.roles?.key || null;
    } catch (err) {
      console.error("Unbekannter Rollen-Fehler", err);
      return null;
    }
  };

  // Session laden + Listener
  useEffect(() => {
    const loadSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Session-Fehler:", error.message);
      }
      const session = data?.session;
      if (session?.user) {
        setUser(session.user);
        const role = await fetchUserRole(session.user.id);
        setCurrentPage(role === "owner" || role === "admin" ? "admin" : "learn");
      } else {
        setUser(null);
        setCurrentPage("landing");
      }
    };
    loadSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          setUser(session.user);
          const role = await fetchUserRole(session.user.id);
          setCurrentPage(role === "owner" || role === "admin" ? "admin" : "learn");
        } else {
          setUser(null);
          setCurrentPage("landing");
        }
      }
    );

    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, []);

  // Auth-Handler
  const handleSignIn = async (email, password) => {
    setLoading(true);
    setMessage("");
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      const loggedInUser = data.user;
      setUser(loggedInUser);

      const role = await fetchUserRole(loggedInUser.id);
      setCurrentPage(role === "owner" || role === "admin" ? "admin" : "learn");
      setMessage("Erfolgreich eingeloggt!");
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Login fehlgeschlagen");
    }
    setLoading(false);
  };

  const handleSignUp = async (email, password, fullName) => {
    setLoading(true);
    setMessage("");
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });
      if (error) throw error;

      const newUser = data.user;
      setUser(newUser);
      setCurrentPage("learn");
      setMessage("Registrierung erfolgreich! Bitte bestätige ggf. deine E-Mail.");

      // Optional: Profil in profiles-Tabelle anlegen
      try {
        await supabase.from("profiles").insert({
          id: newUser.id,
          email: newUser.email,
          username: fullName,
        });
      } catch (profileError) {
        console.warn("Profil optional, Fehler:", profileError.message);
      }
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Registrierung fehlgeschlagen");
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSelectedCourse(null);
    setCurrentPage("landing");
  };

  // ---------- Landing Page ----------
  const LandingPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");

    return (
      <div
        className={`min-h-screen ${
          darkMode
            ? "bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900"
            : "bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50"
        }`}
      >
        <nav
          className={`${
            darkMode ? "bg-gray-900/50" : "bg-white/80"
          } backdrop-blur-lg border-b ${
            darkMode ? "border-gray-800" : "border-gray-200"
          } sticky top-0 z-50`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-2">
                <Rocket
                  className={`w-8 h-8 ${
                    darkMode ? "text-blue-400" : "text-blue-600"
                  }`}
                />
                <span
                  className={`text-xl font-bold ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  CodeLearn
                </span>
              </div>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg ${
                  darkMode ? "bg-gray-800 text-yellow-400" : "bg-gray-200 text-gray-700"
                }`}
              >
                {darkMode ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Text */}
            <div className="space-y-6">
              <h1
                className={`text-5xl md:text-6xl font-bold ${
                  darkMode ? "text-white" : "text-gray-900"
                } leading-tight`}
              >
                Programmieren lernen{" "}
                <span className="bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                  leicht gemacht
                </span>
              </h1>
              <p
                className={`text-xl ${
                  darkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Lerne Programmieren mit interaktiven Lektionen und praktischen Übungen.
                Von Python bis React.
              </p>
              <div className="flex items-center space-x-6 pt-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle
                    className={`w-5 h-5 ${
                      darkMode ? "text-green-400" : "text-green-600"
                    }`}
                  />
                  <span
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    50+ Kurse
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award
                    className={`w-5 h-5 ${
                      darkMode ? "text-yellow-400" : "text-yellow-600"
                    }`}
                  />
                  <span
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Zertifikate
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users
                    className={`w-5 h-5 ${
                      darkMode ? "text-purple-400" : "text-purple-600"
                    }`}
                  />
                  <span
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Community
                  </span>
                </div>
              </div>
            </div>

            {/* Auth-Card */}
            <div
              className={`${
                darkMode ? "bg-gray-800/50" : "bg-white"
              } backdrop-blur-lg rounded-2xl p-8 shadow-2xl border ${
                darkMode ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <h2
                className={`text-2xl font-bold ${
                  darkMode ? "text-white" : "text-gray-900"
                } mb-6`}
              >
                {isLogin ? "Willkommen zurück" : "Jetzt starten"}
              </h2>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (isLogin) {
                    handleSignIn(email, password);
                  } else {
                    handleSignUp(email, password, fullName);
                  }
                }}
                className="space-y-4"
              >
                {!isLogin && (
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg ${
                      darkMode
                        ? "bg-gray-700 text-white"
                        : "bg-gray-50 text-gray-900"
                    } border ${
                      darkMode ? "border-gray-600" : "border-gray-300"
                    } outline-none`}
                    placeholder="Vollständiger Name"
                    required
                  />
                )}

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg ${
                    darkMode ? "bg-gray-700 text-white" : "bg-gray-50 text-gray-900"
                  } border ${
                    darkMode ? "border-gray-600" : "border-gray-300"
                  } outline-none`}
                  placeholder="E-Mail"
                  required
                />

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg ${
                      darkMode
                        ? "bg-gray-700 text-white"
                        : "bg-gray-50 text-gray-900"
                    } border ${
                      darkMode ? "border-gray-600" : "border-gray-300"
                    } outline-none`}
                    placeholder="Passwort"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {message && (
                  <div
                    className={`p-3 rounded-lg text-sm ${
                      message.toLowerCase().includes("erfolgreich")
                        ? "bg-green-500/10 text-green-400"
                        : "bg-red-500/10 text-red-400"
                    }`}
                  >
                    {message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50"
                >
                  {loading
                    ? "Laden..."
                    : isLogin
                    ? "Anmelden"
                    : "Registrieren"}
                </button>

                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className={`w-full text-sm ${
                    darkMode ? "text-blue-400" : "text-blue-600"
                  }`}
                >
                  {isLogin
                    ? "Noch kein Konto? Registrieren"
                    : "Bereits registriert? Anmelden"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ---------- Lernplattform ----------
  const LearnPlatform = () => {
    const [activeTab, setActiveTab] = useState("courses"); // "courses" | "community" | "profile"

    return (
      <div
        className={`min-h-screen ${
          darkMode ? "bg-gray-900" : "bg-gray-50"
        } flex`}
      >
        {/* Sidebar */}
        <aside
          className={`w-20 ${
            darkMode ? "bg-gray-800" : "bg-white"
          } border-r ${
            darkMode ? "border-gray-700" : "border-gray-200"
          } flex flex-col items-center py-6 space-y-6`}
        >
          <Rocket className="w-8 h-8 text-blue-400" />

          <div className="flex-1 space-y-4">
            {[
              { id: "courses", icon: BookOpen },
              { id: "community", icon: MessageCircle },
              { id: "profile", icon: User },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-12 h-12 flex items-center justify-center rounded-lg transition ${
                  activeTab === tab.id
                    ? "bg-blue-500 text-white"
                    : darkMode
                    ? "text-gray-400 hover:bg-gray-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <tab.icon className="w-6 h-6" />
              </button>
            ))}
          </div>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`w-12 h-12 flex items-center justify-center rounded-lg ${
              darkMode ? "bg-gray-700" : "bg-gray-100"
            }`}
          >
            {darkMode ? (
              <Sun className="w-5 h-5 text-yellow-400" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>
          <button
            onClick={handleSignOut}
            className={`w-12 h-12 flex items-center justify-center rounded-lg ${
              darkMode ? "bg-red-500/10 text-red-400" : "bg-red-50 text-red-600"
            }`}
          >
            <LogOut className="w-5 h-5" />
          </button>
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-y-auto">
          <header
            className={`${
              darkMode ? "bg-gray-800" : "bg-white"
            } border-b ${
              darkMode ? "border-gray-700" : "border-gray-200"
            } px-8 py-6`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h1
                  className={`text-2xl font-bold ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Hallo,{" "}
                  {user?.user_metadata?.full_name ||
                    user?.email ||
                    "Lernender"}
                  !
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <div
                  className={`flex items-center space-x-2 px-4 py-2 ${
                    darkMode ? "bg-gray-700" : "bg-gray-100"
                  } rounded-lg`}
                >
                  <Flame className="w-5 h-5 text-orange-400" />
                  <span
                    className={`font-semibold ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    7 Tage
                  </span>
                </div>
                <div
                  className={`flex items-center space-x-2 px-4 py-2 ${
                    darkMode ? "bg-gray-700" : "bg-gray-100"
                  } rounded-lg`}
                >
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  <span
                    className={`font-semibold ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Level 5
                  </span>
                </div>
              </div>
            </div>
          </header>

          <div className="p-8">
            {/* Kurse */}
            {activeTab === "courses" && (
              <div className="space-y-6">
                <h2
                  className={`text-3xl font-bold ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Meine Kurse
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.map((course) => {
                    const colors = colorMap[course.color] || colorMap.blue;
                    return (
                      <div
                        key={course.id}
                        className={`${
                          darkMode ? "bg-gray-800" : "bg-white"
                        } p-6 rounded-xl border ${
                          darkMode ? "border-gray-700" : "border-gray-200"
                        } hover:shadow-xl transition`}
                      >
                        <div
                          className={`w-12 h-12 rounded-lg ${
                            colors.bg
                          } flex items-center justify-center mb-4`}
                        >
                          <Code
                            className={`w-6 h-6 ${colors.text}`}
                          />
                        </div>
                        <h3
                          className={`text-xl font-semibold ${
                            darkMode ? "text-white" : "text-gray-900"
                          } mb-2`}
                        >
                          {course.title}
                        </h3>
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-2">
                            <span
                              className={
                                darkMode
                                  ? "text-gray-400"
                                  : "text-gray-600"
                              }
                            >
                              Fortschritt
                            </span>
                            <span
                              className={
                                darkMode
                                  ? "text-white"
                                  : "text-gray-900"
                              }
                            >
                              {course.progress}%
                            </span>
                          </div>
                          <div
                            className={`w-full h-2 ${
                              darkMode ? "bg-gray-700" : "bg-gray-200"
                            } rounded-full`}
                          >
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${course.progress}%` }}
                            />
                          </div>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span
                            className={
                              darkMode
                                ? "text-gray-500"
                                : "text-gray-500"
                            }
                          >
                            {course.lessons} Lektionen
                          </span>
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              darkMode
                                ? "bg-gray-700 text-gray-300"
                                : "bg-gray-100"
                            }`}
                          >
                            {course.level}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Community */}
            {activeTab === "community" && (
              <div className="space-y-6">
                <h2
                  className={`text-3xl font-bold ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Community
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div
                    className={`${
                      darkMode ? "bg-gray-800" : "bg-white"
                    } p-6 rounded-xl`}
                  >
                    <h3
                      className={`text-xl font-bold ${
                        darkMode ? "text-white" : "text-gray-900"
                      } mb-4`}
                    >
                      Foren
                    </h3>
                    <button className="px-6 py-3 bg-blue-500 text-white rounded-lg">
                      Foren besuchen
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Profil */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                <h2
                  className={`text-3xl font-bold ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Profil
                </h2>
                <div
                  className={`${
                    darkMode ? "bg-gray-800" : "bg-white"
                  } p-6 rounded-xl`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {user?.user_metadata?.full_name?.[0] ||
                        user?.email?.[0] ||
                        "U"}
                    </div>
                    <div>
                      <h3
                        className={`text-xl font-bold ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {user?.user_metadata?.full_name || "Dein Profil"}
                      </h3>
                      <p
                        className={
                          darkMode ? "text-gray-400" : "text-gray-600"
                        }
                      >
                        {user?.email}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  };

  // ---------- Admin Dashboard ----------
  const AdminDashboard = () => {
    const [activeSection, setActiveSection] = useState("overview");

    const stats = [
      { label: "Benutzer", value: "12,543", icon: Users },
      { label: "Kurse", value: "48", icon: BookOpen },
      { label: "Aktive", value: "8,234", icon: BarChart3 },
      { label: "Abgeschlossen", value: "2,156", icon: Trophy },
    ];

    return (
      <div
        className={`min-h-screen ${
          darkMode ? "bg-gray-900" : "bg-gray-50"
        } flex`}
      >
        <aside
          className={`w-64 ${
            darkMode ? "bg-gray-800" : "bg-white"
          } border-r ${
            darkMode ? "border-gray-700" : "border-gray-200"
          } p-4`}
        >
          <div className="flex items-center space-x-2 mb-8">
            <Shield className="w-8 h-8 text-red-400" />
            <span
              className={`font-bold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Admin Panel
            </span>
          </div>

          <nav className="space-y-2">
            {[
              { id: "overview", icon: Home, name: "Übersicht" },
              { id: "users", icon: Users, name: "Benutzer" },
              { id: "courses", icon: BookOpen, name: "Kurse" },
              { id: "analytics", icon: BarChart3, name: "Analytics" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg ${
                  activeSection === item.id
                    ? "bg-red-500 text-white"
                    : darkMode
                    ? "text-gray-400 hover:bg-gray-700"
                    : "hover:bg-gray-100"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </button>
            ))}
          </nav>

          <button
            onClick={handleSignOut}
            className={`w-full mt-8 flex items-center justify-center space-x-2 px-4 py-3 ${
              darkMode ? "bg-red-500/10 text-red-400" : "bg-red-50 text-red-600"
            } rounded-lg`}
          >
            <LogOut className="w-5 h-5" />
            <span>Abmelden</span>
          </button>
        </aside>

        <main className="flex-1 overflow-y-auto">
          <header
            className={`${
              darkMode ? "bg-gray-800" : "bg-white"
            } border-b ${
              darkMode ? "border-gray-700" : "border-gray-200"
            } p-6`}
          >
            <h1
              className={`text-2xl font-bold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Admin Dashboard
            </h1>
          </header>

          <div className="p-6">
            <div className="grid md:grid-cols-4 gap-6">
              {stats.map((stat, idx) => (
                <div
                  key={idx}
                  className={`${
                    darkMode ? "bg-gray-800" : "bg-white"
                  } p-6 rounded-xl border ${
                    darkMode ? "border-gray-700" : "border-gray-200"
                  }`}
                >
                  <stat.icon className="w-8 h-8 text-blue-400 mb-4" />
                  <h3
                    className={`text-2xl font-bold ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {stat.value}
                  </h3>
                  <p
                    className={
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }
                  >
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  };

  // ---------- Top-Level ----------
  if (!user && currentPage === "landing") return <LandingPage />;
  if (user && currentPage === "admin") return <AdminDashboard />;
  if (user && currentPage === "learn") return <LearnPlatform />;
  return <LandingPage />;
};

export default ModernItPlatform;
