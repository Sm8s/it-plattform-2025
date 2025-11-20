import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';

export default function AuthPage() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');

  if (session) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async e => {
    e.preventDefault();
    setMsg('');
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setMsg('Login erfolgreich.');
        navigate('/dashboard');
      } else if (mode === 'register') {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMsg('Registrierung erfolgreich. Prüfe ggf. dein Postfach für eine Bestätigungsmail.');
        if (data.user) {
          await supabase.from('profiles').insert({
            id: data.user.id,
            username: email.split('@')[0],
            full_name: '',
            locale: 'de'
          });
        }
        navigate('/dashboard');
      } else if (mode === 'reset') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + '/auth'
        });
        if (error) throw error;
        setMsg('Passwort-Reset-Mail wurde gesendet (falls die Adresse existiert).');
      }
    } catch (err) {
      setMsg(err.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <main className="section">
      <h2>Login / Registrierung</h2>
      {session && (
        <p>
          Eingeloggt als {session.user.email}{' '}
          <button onClick={handleLogout} className="btn">
            Logout
          </button>
        </p>
      )}

      <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
        <button
          className="btn"
          onClick={() => setMode('login')}
          style={{ marginRight: '.5rem', opacity: mode === 'login' ? 1 : .7 }}
        >
          Login
        </button>
        <button
          className="btn"
          onClick={() => setMode('register')}
          style={{ marginRight: '.5rem', opacity: mode === 'register' ? 1 : .7 }}
        >
          Registrieren
        </button>
        <button
          className="btn"
          onClick={() => setMode('reset')}
          style={{ opacity: mode === 'reset' ? 1 : .7 }}
        >
          Passwort vergessen
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ maxWidth: '360px' }}>
        <div style={{ marginBottom: '.8rem' }}>
          <label style={{ display: 'block', fontSize: '.85rem', marginBottom: '.2rem' }}>Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{
              width: '100%',
              padding: '.6rem .8rem',
              borderRadius: '.8rem',
              border: '1px solid rgba(148,163,184,0.6)',
              background: 'rgba(15,23,42,0.9)',
              color: '#e5e7eb'
            }}
          />
        </div>
        {mode !== 'reset' && (
          <div style={{ marginBottom: '.8rem' }}>
            <label style={{ display: 'block', fontSize: '.85rem', marginBottom: '.2rem' }}>Passwort</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '.6rem .8rem',
                borderRadius: '.8rem',
                border: '1px solid rgba(148,163,184,0.6)',
                background: 'rgba(15,23,42,0.9)',
                color: '#e5e7eb'
              }}
            />
          </div>
        )}
        <button className="btn btn-primary" type="submit">
          {mode === 'login' ? 'Login' : mode === 'register' ? 'Registrieren' : 'Reset anfordern'}
        </button>
      </form>

      {msg && <p style={{ marginTop: '1rem', fontSize: '.9rem' }}>{msg}</p>}
    </main>
  );
}
