import { useEffect, useState } from 'react';
import { useToken } from '../context/TokenContext';

type Task = {
  id: number;
  title: string;
  status: 'To Do' | 'In Progress' | 'Done';
  assignedTo?: { username: string };
};

const statuses: Task['status'][] = ['To Do', 'In Progress', 'Done'];

export default function Dashboard() {
  const token = useToken();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterUser, setFilterUser] = useState('');

  useEffect(() => {
    if (!token) return;
    fetch('http://localhost:3000/api/tasks', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setTasks(data))
      .catch(err => console.error('Failed to load tasks:', err));
  }, [token]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f7', padding: '2rem' }}>
      {/* Filter Bar */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '12px',
            border: '1px solid #ccc',
            backgroundColor: 'white',
            fontSize: '1rem',
          }}
        >
          <option value="">All Statuses</option>
          {statuses.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Filter by user"
          value={filterUser}
          onChange={e => setFilterUser(e.target.value)}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '12px',
            border: '1px solid #ccc',
            backgroundColor: 'white',
            fontSize: '1rem',
            flex: 1,
          }}
        />
      </div>

      {/* Task Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
        {statuses.map(status => (
          <div key={status}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>{status}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {tasks
                .filter(task => task.status === status)
                .filter(task =>
                  !filterUser || task.assignedTo?.username?.includes(filterUser)
                )
                .map(task => (
                  <div
                    key={task.id}
                    style={{
                      backgroundColor: 'white',
                      borderRadius: '16px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                      padding: '1rem',
                    }}
                  >
                    <h4 style={{ marginBottom: '0.5rem', fontSize: '1rem' }}>{task.title}</h4>
                    <p style={{ fontSize: '0.875rem', color: '#555' }}>
                      Assigned to: {task.assignedTo?.username || 'Unassigned'}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}