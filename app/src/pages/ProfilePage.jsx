import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { supabase } from '../supabaseClient';

export default function ProfilePage() {
  const { session, profile } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.username || '');
  const [gender, setGender] = useState(profile?.gender || '');
  const [email, setEmail] = useState(session?.user?.email || '');
  const [avatarPreview, setAvatarPreview] = useState(profile?.avatar_url || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [progressInfo, setProgressInfo] = useState({
    currentCourse: null,
    lastActivity: null,
    completion: null,
  });

  useEffect(() => {
    setDisplayName(profile?.username || '');
    setGender(profile?.gender || '');
    setAvatarPreview(profile?.avatar_url || '');
  }, [profile]);

  useEffect(() => {
    const loadProgress = async () => {
      if (!session) return;

      const { data, error } = await supabase
        .from('lesson_progress')
        .select('status, completed_at, lessons ( title_de )')
        .eq('user_id', session.user.id)
        .order('completed_at', { ascending: false })
        .limit(1);

      if (!error && data && data.length > 0) {
        const row = data[0];
        setProgressInfo({
          currentCourse: row.lessons?.title_de || null,
          lastActivity: row.completed_at || null,
          completion: row.status || null,
        });
      }
    };
    loadProgress();
  }, [session]);

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result || '');
    };
    reader.readAsDataURL(file);
  };

  const initials = (displayName || email || 'User')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleSave = async () => {
    if (!session) return;

    setSaving(true);
    setMessage('');

    const updates = {
      username: displayName || null,
      gender: gender || null,
    };

    const profileId = profile?.id || session.user.id;

    const { error: profileError } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', profileId);

    let authError = null;
    if (email && email !== session.user.email) {
      const { error } = await supabase.auth.updateUser({ email });
      authError = error;
    }

    if (profileError || authError) {
      setMessage('Konnte Änderungen nicht komplett speichern.');
    } else {
      setMessage('Profil wurde gespeichert.');
    }
    setSaving(false);
  };

  const progressLabel =
    progressInfo.completion === 'completed'
      ? 'Kurs abgeschlossen'
      : progressInfo.completion === 'in_progress'
      ? 'Kurs läuft'
      : 'Noch kein Fortschritt gespeichert';

  return (
    <main className="section">
      <div className="section-narrow">
        <header className="page-header">
          <h1 className="page-title">Dein Profil</h1>
          <p className="page-subtitle">
            Passe deine Daten an, sieh deinen Fortschritt und verwalte deine Anmeldung.
          </p>
        </header>

        <div className="profile-layout">
          {/* Persönliche Informationen */}
          <section className="profile-card">
            <h2>Persönliche Informationen</h2>

            <div className="profile-avatar-shell">
              <div className="profile-avatar">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" />
                ) : (
                  <span>{initials}</span>
                )}
                <button
                  type="button"
                  className="profile-avatar-button"
                  onClick={() => document.getElementById('avatarUpload')?.click()}
                >
                  Bild ändern
                </button>
                <input
                  id="avatarUpload"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleAvatarChange}
                />
              </div>
              <div className="profile-meta-row">
                <span className="profile-chip">
                  {displayName || 'Noch kein Name gesetzt'}
                </span>
                <span className="profile-chip">
                  {gender || 'Geschlecht nicht angegeben'}
                </span>
              </div>
            </div>

            <div className="profile-grid-2">
              <div>
                <label className="label">Name</label>
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Dein Anzeige-Name"
                />
              </div>
              <div>
                <label className="label">Geschlecht</label>
                <select value={gender} onChange={(e) => setGender(e.target.value)}>
                  <option value="">Keine Angabe</option>
                  <option value="female">Weiblich</option>
                  <option value="male">Männlich</option>
                  <option value="diverse">Divers</option>
                </select>
              </div>
            </div>
          </section>

          {/* Fortschritt & Sicherheit */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
            <section className="profile-card">
              <h2>Lernfortschritt</h2>

              <p style={{ fontSize: '.8rem', opacity: .8, marginBottom: '.6rem' }}>
                Überblick über deinen aktuellen Kurs und die letzte Aktivität.
              </p>

              <div className="profile-grid-2">
                <div>
                  <label className="label">Aktueller Kurs</label>
                  <div style={{ fontSize: '.9rem' }}>
                    {progressInfo.currentCourse || 'Noch kein Kurs gestartet'}
                  </div>
                </div>
                <div>
                  <label className="label">Letzte Aktivität</label>
                  <div style={{ fontSize: '.9rem' }}>
                    {progressInfo.lastActivity
                      ? new Date(progressInfo.lastActivity).toLocaleString()
                      : 'Keine Aktivität vorhanden'}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '.8rem' }}>
                <div className="label">Status</div>
                <div style={{ fontSize: '.85rem', marginBottom: '.2rem' }}>
                  {progressLabel}
                </div>
                <div className="profile-progress-bar">
                  <div
                    className="profile-progress-bar-inner"
                    style={{
                      width:
                        progressInfo.completion === 'completed'
                          ? '100%'
                          : progressInfo.completion === 'in_progress'
                          ? '55%'
                          : '0%',
                    }}
                  />
                </div>
              </div>
            </section>

            <section className="profile-card">
              <h2>Sicherheit &amp; Anmeldung</h2>
              <p style={{ fontSize: '.8rem', opacity: .8, marginBottom: '.6rem' }}>
                Verwalte deine E-Mail-Adresse. Passwort-Änderung kannst du später hier ergänzen.
              </p>

              <div className="profile-grid-2">
                <div>
                  <label className="label">E-Mail</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="deine@mail.de"
                  />
                </div>
              </div>

              <div style={{ marginTop: '1rem', display: 'flex', gap: '.6rem' }}>
                <button
                  type="button"
                  className="btn"
                  style={{ fontSize: '.8rem' }}
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? 'Speichere…' : 'Änderungen speichern'}
                </button>
                {message && (
                  <div style={{ fontSize: '.8rem', opacity: .85, alignSelf: 'center' }}>
                    {message}
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
