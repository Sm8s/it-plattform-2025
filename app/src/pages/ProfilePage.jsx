
import React, { useState } from "react";

export default function ProfilePage() {
  const [preview, setPreview] = useState("https://ui-avatars.com/api/?name=User&background=0f172a&color=22c55e");

  const handleUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 p-6 md:p-10 text-slate-900 dark:text-slate-100">
      <div className="max-w-5xl mx-auto rounded-2xl bg-white/10 backdrop-blur-xl shadow-xl p-6 md:p-10 border border-white/10">
        <h1 className="text-3xl font-bold mb-6">Dein Profil</h1>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Persönliche Informationen */}
          <div className="p-5 bg-slate-800/40 rounded-xl shadow-lg border border-white/10">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400 mb-4">
              Persönliche Informationen
            </h2>

            {/* Profilbild */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <img
                  src={preview}
                  className="h-32 w-32 rounded-full object-cover border-2 border-slate-700 shadow-xl hover:scale-105 transition"
                />
                <button
                  onClick={() => document.getElementById("avatarUpload").click()}
                  className="absolute bottom-1 right-1 bg-slate-900 p-2 rounded-full border border-emerald-400 shadow-md hover:scale-110 transition"
                >
                  📸
                </button>
              </div>

              <input
                id="avatarUpload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleUpload}
              />
            </div>

            <label className="block mt-5 text-xs uppercase tracking-wider text-slate-400">Name</label>
            <input
              type="text"
              placeholder="Max Mustermann"
              className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-900/50 border border-slate-700 focus:ring-2 focus:ring-emerald-400 transition"
            />

            <label className="block mt-4 text-xs uppercase tracking-wider text-slate-400">Geschlecht</label>
            <select className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-900/50 border border-slate-700 focus:ring-2 focus:ring-emerald-400 transition">
              <option>Bitte auswählen</option>
              <option>Weiblich</option>
              <option>Männlich</option>
              <option>Divers</option>
              <option>Keine Angabe</option>
            </select>
          </div>

          {/* Fortschritt & Sicherheit */}
          <div className="md:col-span-2 space-y-8">
            {/* Lernfortschritt */}
            <div className="p-5 bg-slate-800/40 rounded-xl shadow-lg border border-white/10">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400 mb-4">
                Lernfortschritt
              </h2>

              <p className="text-sm font-medium">Aktueller Kurs:</p>
              <p className="text-lg font-semibold mt-1">JavaScript Grundlagen</p>

              <div className="mt-3 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full w-2/3 bg-gradient-to-r from-emerald-400 to-cyan-400 animate-pulse"></div>
              </div>

              <p className="mt-2 text-xs text-slate-400">
                67% abgeschlossen – weiter so!
              </p>

              <p className="mt-4 text-sm font-medium">Letzte Aktivität:</p>
              <p className="mt-1 text-slate-300">
                Heute, 10:24 Uhr – Quiz „Variablen & Datentypen“
              </p>
            </div>

            {/* Sicherheit */}
            <div className="p-5 bg-slate-800/40 rounded-xl shadow-lg border border-white/10">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400 mb-4">
                Sicherheit & Anmeldung
              </h2>

              <label className="block text-xs uppercase tracking-wider text-slate-400">E-Mail</label>
              <input
                type="email"
                placeholder="du@example.com"
                className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-900/50 border border-slate-700 focus:ring-2 focus:ring-emerald-400 transition"
              />

              <label className="block mt-4 text-xs uppercase tracking-wider text-slate-400">Passwort</label>
              <input
                type="password"
                placeholder="••••••••••"
                className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-900/50 border border-slate-700 focus:ring-2 focus:ring-emerald-400 transition"
              />

              <div className="mt-5 flex gap-3">
                <button className="px-4 py-2 rounded-full bg-slate-900 border border-slate-500 text-sm hover:bg-slate-800 transition">
                  Sicherheit prüfen
                </button>
                <button className="px-4 py-2 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-900 font-semibold text-sm hover:shadow-lg hover:-translate-y-0.5 transition">
                  Änderungen speichern
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
