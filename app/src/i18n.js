const translations = {
  de: {
    appName: "IT Lernplattform",
    tagline: "Lerne IT Schritt für Schritt – interaktiv, spielerisch, praxisnah.",
    getStarted: "Jetzt starten",
    continueLearning: "Weiterlernen",
    courses: "Kurse",
    community: "Community",
    profile: "Profil",
    logout: "Logout",
    login: "Login",
    register: "Registrieren"
  },
  en: {
    appName: "IT Learning Platform",
    tagline: "Learn IT step by step – interactive, playful, hands-on.",
    getStarted: "Get started",
    continueLearning: "Continue learning",
    courses: "Courses",
    community: "Community",
    profile: "Profile",
    logout: "Logout",
    login: "Login",
    register: "Register"
  }
};

export function t(locale, key) {
  return translations[locale]?.[key] || translations["de"][key] || key;
}
