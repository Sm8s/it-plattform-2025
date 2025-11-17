import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export default function UsersPage() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, username, full_name, xp, level, created_at')
        .order('created_at', { ascending: false })
        .limit(100);
      setUsers(data || []);
    };
    load();
  }, []);

  return (
    <div className="card">
      <h2>Benutzerverwaltung</h2>
      <p style={{ fontSize: '.85rem', opacity: .8 }}>
        Hier siehst du die Profildaten. Später kannst du Rollen/Rights, Sperren, Export/Import usw. ergänzen.
      </p>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Name</th>
            <th>XP</th>
            <th>Level</th>
            <th>Registriert</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.id}</td>
              <td>{u.username}</td>
              <td>{u.full_name}</td>
              <td>{u.xp}</td>
              <td>{u.level}</td>
              <td>{new Date(u.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
