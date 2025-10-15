import { useEffect, useMemo, useState } from 'react';
import { useToken } from '../context/TokenContext';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';

type Task = {
  id: number;
  title: string;
  status: 'To Do' | 'In Progress' | 'Done';
  assignedTo?: { id?: number; username: string };
};

type User = {
  id: number;
  username: string;
  role: string;
};

type Draft = {
  id: string; // local-only id
  title: string;
  status: Task['status'];
  assignedToId?: number;
};

const STATUSES: Task['status'][] = ['To Do', 'In Progress', 'Done'];

export default function Dashboard() {
  const { token } = useToken();
  const { user } = useUser();
  const navigate = useNavigate();

  const isAdmin = user?.role === 'admin';

  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterUser, setFilterUser] = useState<string>('');

  // Multiple drafts that stack newest-first
  const [drafts, setDrafts] = useState<Draft[]>([]);

  // Load tasks and users
  useEffect(() => {
    if (!token) return;

    const load = async () => {
      try {
        const [tasksRes, usersRes] = await Promise.all([
          fetch('http://localhost:3000/api/tasks', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch('http://localhost:3000/api/users', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const tasksJson = await tasksRes.json();
        const usersJson = await usersRes.json();

        if (Array.isArray(tasksJson)) {
          // Show newest first; fall back to id ordering
          const sorted = [...tasksJson].sort((a: Task, b: Task) => (b.id ?? 0) - (a.id ?? 0));
          setTasks(sorted);
        } else {
          setTasks([]);
        }

        if (Array.isArray(usersJson)) {
          setUsers(usersJson);
        } else {
          setUsers([]);
        }
      } catch (e) {
        console.error('Failed to load data:', e);
      }
    };

    load();
  }, [token]);

  // Filters
  const filteredTasks = useMemo(() => {
    let t = tasks;
    if (filterStatus) t = t.filter(task => task.status === filterStatus);
    if (filterUser) t = t.filter(task => task.assignedTo?.username === filterUser);
    return t;
  }, [tasks, filterStatus, filterUser]);

  // Add a new draft at the top of "To Do"
  const addDraft = () => {
    const newDraft: Draft = {
      id: cryptoRandomId(),
      title: '',
      status: 'To Do',
      assignedToId: undefined,
    };
    setDrafts(prev => [newDraft, ...prev]);
  };

  // Update a specific draft field
  const updateDraft = (id: string, patch: Partial<Draft>) => {
    setDrafts(prev => prev.map(d => (d.id === id ? { ...d, ...patch } : d)));
  };

  // Save all drafts to DB
  const saveAllDrafts = async () => {
    if (!token || drafts.length === 0) return;

    // Only save drafts with non-empty titles
    const toSave = drafts.filter(d => d.title.trim().length > 0);
    if (toSave.length === 0) return;

    try {
      for (const d of toSave) {
        const payload: any = {
          title: d.title.trim(),
          status: d.status,
        };
        if (isAdmin && d.assignedToId) {
          // Backend expects assignedTo? If it's userId, adjust name as needed
          payload.assignedTo = d.assignedToId;
        }

        const res = await fetch('http://localhost:3000/api/tasks', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          console.error('Task creation failed:', err);
          continue;
        }
      }

      // Refresh tasks from DB to show authoritative latest data
      try {
        const tasksRes = await fetch('http://localhost:3000/api/tasks', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const tasksJson = await tasksRes.json();
        if (Array.isArray(tasksJson)) {
          const sorted = [...tasksJson].sort((a: Task, b: Task) => (b.id ?? 0) - (a.id ?? 0));
          setTasks(sorted);
        }
      } catch (e) {
        console.error('Failed to reload tasks after save:', e);
      }

      // Clear drafts after save
      setDrafts([]);
    } catch (e) {
      console.error('Save drafts error:', e);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/');
  };

  // Show Save button only if any draft has a non-empty title
  const showSaveButton = drafts.some(d => d.title.trim().length > 0);

    return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        backgroundColor: '#f9f9f9',
        padding: '2rem',
        boxSizing: 'border-box',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif',
      }}
    >
      {/* Top bar with filters (not flush to top) */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '0.5rem',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            style={{
              padding: '0.5rem 0.75rem',
              borderRadius: '12px',
              border: '1px solid #ccc',
              backgroundColor: 'white',
              fontSize: '0.95rem',
              fontFamily: 'inherit',
            }}
          >
            <option value="">All Statuses</option>
            {STATUSES.map(s => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {/* User filter */}
          <select
            value={filterUser}
            onChange={e => setFilterUser(e.target.value)}
            style={{
              padding: '0.5rem 0.75rem',
              borderRadius: '12px',
              border: '1px solid #ccc',
              backgroundColor: 'white',
              fontSize: '0.95rem',
              fontFamily: 'inherit',
            }}
          >
            <option value="">All Users</option>
            {users.map(u => (
              <option key={u.id} value={u.username}>
                {u.username}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {showSaveButton && (
            <button
              onClick={saveAllDrafts}
              style={{
                height: '2.5rem',
                padding: '0 1rem',
                borderRadius: '12px',
                backgroundColor: '#007aff', // blue
                color: 'white',
                fontSize: '1rem',
                fontFamily: 'inherit',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Save
            </button>
          )}

          <button
            onClick={addDraft}
            style={{
              height: '2.5rem',
              width: '2.5rem',
              borderRadius: '12px',
              backgroundColor: '#8e8e93', // grey
              color: 'white',
              fontSize: '1.5rem',
              fontFamily: 'inherit',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Add task"
            title="Add task"
          >
            +
          </button>

          <button
            onClick={handleLogout}
            style={{
              height: '2.5rem',
              padding: '0 1rem',
              borderRadius: '12px',
              border: '1px solid #ccc',
              backgroundColor: '#e0e0e0', // grey
              color: '#1c1c1e',
              fontSize: '1rem',
              fontFamily: 'inherit',
              cursor: 'pointer',
            }}
          >
            Log Out
          </button>
        </div>
      </div>

      {/* Board */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1.5rem',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        {STATUSES.map(status => (
          <div key={status}>
            <h3
              style={{
                marginBottom: '0.75rem',
                fontSize: '1.15rem',
                fontWeight: 600,
                color: '#111',
              }}
            >
              {status}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {/* Drafts appear in their current column based on status */}
              {drafts
                .filter(d => d.status === status)
                .map(draft => (
                  <div
                    key={draft.id}
                    style={{
                      backgroundColor: 'white',
                      borderRadius: '16px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                      padding: '0.9rem',
                      border: '1px solid #eee',
                    }}
                  >
                    {/* Title input */}
                    <input
                      value={draft.title}
                      onChange={e => updateDraft(draft.id, { title: e.target.value })}
                      placeholder="Enter task title..."
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.8rem',
                        borderRadius: '12px',
                        border: '1px solid #ccc',
                        fontSize: '0.95rem',
                        fontFamily: 'inherit',
                        backgroundColor: '#f2f2f7',
                        marginBottom: '0.6rem',
                      }}
                    />

                    {/* Status dropdown (default To Do) */}
                    <select
                      value={draft.status}
                      onChange={e =>
                        updateDraft(draft.id, { status: e.target.value as Draft['status'] })
                      }
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '12px',
                        border: '1px solid #ccc',
                        backgroundColor: 'white',
                        fontSize: '0.95rem',
                        fontFamily: 'inherit',
                        marginBottom: isAdmin ? '0.6rem' : 0,
                      }}
                    >
                      {STATUSES.map(s => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>

                    {/* Assignee dropdown only for admin */}
                    {isAdmin && (
                      <select
                        value={draft.assignedToId ?? ''}
                        onChange={e =>
                          updateDraft(draft.id, {
                            assignedToId: e.target.value
                              ? parseInt(e.target.value, 10)
                              : undefined,
                          })
                        }
                        style={{
                          width: '100%',
                          padding: '0.5rem 0.75rem',
                          borderRadius: '12px',
                          border: '1px solid #ccc',
                          backgroundColor: 'white',
                          fontSize: '0.95rem',
                          fontFamily: 'inherit',
                        }}
                      >
                        <option value="">Unassigned</option>
                        {users.map(u => (
                          <option key={u.id} value={u.id}>
                            {u.username}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                ))}

              {/* Existing tasks (filtered), newest on top */}
              {filteredTasks
                .filter(t => t.status === status)
                .map(task => (
                  <div
                    key={task.id}
                    style={{
                      backgroundColor: 'white',
                      borderRadius: '16px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                      padding: '0.9rem',
                      border: '1px solid #eee',
                    }}
                  >
                    <h4
                      style={{
                        marginBottom: '0.4rem',
                        fontSize: '1rem',
                        fontWeight: 500,
                        color: '#222',
                      }}
                    >
                      {task.title}
                    </h4>
                    <p
                      style={{
                        fontSize: '0.85rem',
                        color: '#555',
                      }}
                    >
                      Status: {task.status}
                    </p>
                    <p
                      style={{
                        fontSize: '0.85rem',
                        color: '#555',
                      }}
                    >
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

/** Simple crypto-safe-ish random id for drafts */
function cryptoRandomId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    // @ts-ignore
    return crypto.randomUUID();
  }
  return 'd_' + Math.random().toString(36).slice(2);
}