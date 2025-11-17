import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export default function LogsPage() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      setLogs(data || []);
    };
    load();
  }, []);

  return (
    <div className="card">
      <h2>Audit Logs & Security</h2>
      <p style={{ fontSize: '.85rem', opacity: .8 }}>
        Hier siehst du die letzten Aktionen. Später kannst du IPs, Geolocations, Admin-Events, Fehlversuche usw. loggen.
      </p>
      <table>
        <thead>
          <tr>
            <th>Zeit</th>
            <th>Actor</th>
            <th>Action</th>
            <th>Entity</th>
            <th>Meta</th>
          </tr>
        </thead>
        <tbody>
          {logs.map(l => (
            <tr key={l.id}>
              <td>{new Date(l.created_at).toLocaleString()}</td>
              <td>{l.actor_id}</td>
              <td>{l.action}</td>
              <td>{l.entity_type} {l.entity_id}</td>
              <td style={{ maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {JSON.stringify(l.meta)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
