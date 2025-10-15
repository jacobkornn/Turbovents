import { useEffect, useState } from 'react';
import { useToken } from '../context/TokenContext';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';

type Task = {
  id: number;
  title: string;
  status: 'To Do' | 'In Progress' | 'Done';
  assignedTo?: { username: string };
};

type User = {
  id: number;
  username: string;
  role: string;
};

const statuses: Task['status'][] = ['To Do', 'In Progress', 'Done'];

export default function Dashboard() {
  const { token } = useToken();
  const { user } = useUser();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterUser, setFilterUser] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newStatus, setNewStatus] = useState('To Do');
  const [newAssignee, setNewAssignee] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [showSaveButton, setShowSaveButton] = useState(false);

  useEffect(() => {
    if (!token) return;

    fetch('http://localhost:3000/api/tasks', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setTasks(data);
        } else {
          console.error('Unexpected task response:', data);
          setTasks([]);
        }
      })
      .catch(err => console.error('Failed to load tasks:', err));

    fetch('http://localhost:3000/api/users', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setUsers(data);
        } else {
          console.error('Unexpected user response:', data);
          setUsers([]);
        }
      })
      .catch(err => console.error('Failed to load users:', err));
  }, [token]);

  const handleCreateTask = async () => {
    if (!token) {
      console.error('Missing token during task creation');
      return;
    }

    if (!newTitle.trim()) {
      console.error('Task title is required');
      return;
    }

    const payload: any = {
      title: newTitle.trim(),
      status: newStatus,
    };

    if (user?.role === 'admin' && newAssignee) {
      payload.assignedTo = parseInt(newAssignee);
    }

    const res = await fetch('http://localhost:3000/api/tasks', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const created = await res.json();
      setTasks(prev => [created, ...prev]);
      setNewTitle('');
      setNewStatus('To Do');
      setNewAssignee('');
      setIsCreating(false);
      setShowSaveButton(false);
    } else {
      const error = await res.json();
      console.error('Task creation failed:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/');
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      backgroundColor: '#f9f9f9',
      padding: '2rem',
      boxSizing: 'border-box',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif'
    }}>
      {/* Top Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {showSaveButton && (
            <button
              onClick={handleCreateTask}
              style={{
                height: '2.5rem',
                padding: '0 1rem',
                borderRadius: '12px',
                backgroundColor: '#34c759',
                color: 'white',
                fontSize: '1rem',
                fontFamily: 'inherit',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Save
            </button>
          )}
          <button
            onClick={() => {
              setIsCreating(true);
              setShowSaveButton(false);
              setNewTitle('');
              setNewStatus('To Do');
              setNewAssignee('');
            }}
            style={{
              height: '2.5rem',
              width: '2.5rem',
              borderRadius: '12px',
              backgroundColor: '#007aff',
              color: 'white',
              fontSize: '1.5rem',
              fontFamily: 'inherit',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            +
          </button>

          <button
            onClick={handleLogout}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '12px',
              border: '1px solid #ccc',
              backgroundColor: '#e0e0e0',
              color: '#007aff',
              fontSize: '1rem',
              fontFamily: 'inherit',
              cursor: 'pointer'
            }}
          >
            Log Out
          </button>
        </div>
      </div>

      {/* Task Columns */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '2rem',
        width: 'calc(100vw - 4rem)',
        boxSizing: 'border-box'
      }}>
        {statuses.map(status => (
          <div key={status}>
            <h3 style={{
              marginBottom: '1rem',
              fontSize: '1.25rem',
              fontWeight: 600
            }}>
              {status}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {status === 'To Do' && isCreating && (
                <div style={{
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  padding: '1rem',
                  marginBottom: '1rem'
                }}>
                  <input
                    value={newTitle}
                    onChange={e => {
                      setNewTitle(e.target.value);
                      setShowSaveButton(true);
                    }}
                    placeholder="Enter task title..."
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '12px',
                      border: '1px solid #ccc',
                      fontSize: '1rem',
                      fontFamily: 'inherit',
                      backgroundColor: '#f2f2f7'
                    }}
                  />
                </div>
              )}
              {Array.isArray(tasks) &&
                tasks
                  .filter(task => task.status === status)
                  .filter(task => !filterUser || task.assignedTo?.username === filterUser)
                  .map(task => (
                    <div
                      key={task.id}
                      style={{
                        backgroundColor: 'white',
                        borderRadius: '16px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                        padding: '1rem'
                      }}
                    >
                      <h4 style={{
                        marginBottom: '0.5rem',
                        fontSize: '1rem',
                        fontWeight: 500
                      }}>
                        {task.title}
                      </h4>
                      <p style={{
                        fontSize: '0.875rem',
                        color: '#555'
                      }}>
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