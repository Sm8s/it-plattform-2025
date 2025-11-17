import React from 'react';

export default function ContentPage() {
  return (
    <>
      <div className="card">
        <h2>Content-Editor & Medienverwaltung</h2>
        <p style={{ fontSize: '.85rem', opacity: .85 }}>
          Hier kannst du später:
        </p>
        <ul style={{ fontSize: '.85rem', opacity: .85 }}>
          <li>Drag & Drop Page Builder für Landing-Sections implementieren</li>
          <li>Bilder, Videos und Snippets in Supabase Storage verwalten</li>
          <li>Mehrsprachige Inhalte für DE/EN pflegen</li>
        </ul>
        <p style={{ fontSize: '.85rem', opacity: .85 }}>
          Für das MVP ist diese Seite nur ein Platzhalter, damit die Struktur steht.
        </p>
      </div>
    </>
  );
}
