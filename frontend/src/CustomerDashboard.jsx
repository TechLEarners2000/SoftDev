import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getIdeas, createIdea, getIdeaDetail, getStats } from './api';
import { useNavigate } from 'react-router-dom';

const CustomerDashboard = () => {
  const { user, logoutUser } = useAuth();
  const [ideas, setIdeas] = useState([]);
  const [stats, setStats] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchIdeas();
    fetchStats();
  }, []);

  const fetchIdeas = async () => {
    try {
      const response = await getIdeas();
      setIdeas(response.data);
    } catch (error) {
      console.error('Error fetching ideas:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createIdea(formData);
      setFormData({ title: '', description: '' });
      setShowForm(false);
      fetchIdeas();
      fetchStats();
    } catch (error) {
      console.error('Error creating idea:', error);
    }
  };

  const viewDetails = async (ideaId) => {
    try {
      const response = await getIdeaDetail(ideaId);
      setSelectedIdea(response.data);
    } catch (error) {
      console.error('Error fetching idea details:', error);
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'in_progress': return '#3b82f6';
      case 'completed': return '#10b981';
      default: return '#6b7280';
    }
  };

  return (
    <div style={styles.container}>
      <nav style={styles.navbar}>
        <h1 style={styles.logo}>Customer Dashboard</h1>
        <div style={styles.userInfo}>
          <span style={styles.userName}>{user?.name}</span>
          <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
        </div>
      </nav>

      <div style={styles.content}>
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <h3 style={styles.statLabel}>Total Ideas</h3>
            <p style={styles.statValue}>{stats.total || 0}</p>
          </div>
          <div style={styles.statCard}>
            <h3 style={styles.statLabel}>Pending</h3>
            <p style={styles.statValue}>{stats.pending || 0}</p>
          </div>
          <div style={styles.statCard}>
            <h3 style={styles.statLabel}>In Progress</h3>
            <p style={styles.statValue}>{stats.in_progress || 0}</p>
          </div>
          <div style={styles.statCard}>
            <h3 style={styles.statLabel}>Completed</h3>
            <p style={styles.statValue}>{stats.completed || 0}</p>
          </div>
        </div>

        <div style={styles.header}>
          <h2 style={styles.title}>My Ideas</h2>
          <button onClick={() => setShowForm(!showForm)} style={styles.addBtn}>
            {showForm ? 'Cancel' : '+ Submit New Idea'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} style={styles.form}>
            <input
              type="text"
              placeholder="Idea Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              style={styles.input}
              required
            />
            <textarea
              placeholder="Describe your idea or problem..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              style={styles.textarea}
              rows="4"
              required
            />
            <button type="submit" style={styles.submitBtn}>Submit Idea</button>
          </form>
        )}

        <div style={styles.ideasList}>
          {ideas.map((idea) => (
            <div key={idea.id} style={styles.ideaCard}>
              <div style={styles.ideaHeader}>
                <h3 style={styles.ideaTitle}>{idea.title}</h3>
                <span style={{...styles.badge, background: getStatusColor(idea.status)}}>
                  {idea.status}
                </span>
              </div>
              <p style={styles.ideaDesc}>{idea.description}</p>
              <div style={styles.ideaFooter}>
                <span style={styles.date}>
                  Submitted: {new Date(idea.created_at).toLocaleDateString()}
                </span>
                <button onClick={() => viewDetails(idea.id)} style={styles.viewBtn}>
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>

        {selectedIdea && (
          <div style={styles.modal} onClick={() => setSelectedIdea(null)}>
            <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <h2>{selectedIdea.title}</h2>
                <button onClick={() => setSelectedIdea(null)} style={styles.closeBtn}>×</button>
              </div>
              <p style={styles.modalDesc}>{selectedIdea.description}</p>
              <div style={styles.modalStatus}>
                <strong>Status:</strong> <span style={{color: getStatusColor(selectedIdea.status)}}>{selectedIdea.status}</span>
              </div>
              {selectedIdea.updates && selectedIdea.updates.length > 0 && (
                <div style={styles.updates}>
                  <h3 style={styles.updatesTitle}>Updates</h3>
                  {selectedIdea.updates.map((update) => (
                    <div key={update.id} style={styles.updateItem}>
                      <div style={styles.updateHeader}>
                        <strong>{update.user_name} ({update.user_role})</strong>
                        <span style={styles.updateDate}>{new Date(update.created_at).toLocaleString()}</span>
                      </div>
                      <p style={styles.updateMessage}>{update.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: '#f1f5f9',
  },
  navbar: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '16px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: 'white',
  },
  logo: {
    fontSize: '20px',
    fontWeight: 'bold',
    margin: 0,
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  userName: {
    fontSize: '14px',
  },
  logoutBtn: {
    padding: '8px 16px',
    background: 'rgba(255,255,255,0.2)',
    border: '1px solid white',
    borderRadius: '6px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '14px',
  },
  content: {
    padding: '24px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  statCard: {
    background: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  statLabel: {
    fontSize: '14px',
    color: '#64748b',
    margin: '0 0 8px 0',
  },
  statValue: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#1e293b',
    margin: 0,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1e293b',
    margin: 0,
  },
  addBtn: {
    padding: '10px 20px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
  },
  form: {
    background: 'white',
    padding: '24px',
    borderRadius: '8px',
    marginBottom: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '14px',
    marginBottom: '12px',
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%',
    padding: '12px',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '14px',
    marginBottom: '12px',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  },
  submitBtn: {
    padding: '12px 24px',
    background: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
  },
  ideasList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  ideaCard: {
    background: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  ideaHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
  },
  ideaTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1e293b',
    margin: 0,
  },
  badge: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    color: 'white',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  ideaDesc: {
    color: '#475569',
    marginBottom: '12px',
  },
  ideaFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: '12px',
    color: '#94a3b8',
  },
  viewBtn: {
    padding: '6px 16px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
  },
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalContent: {
    background: 'white',
    padding: '24px',
    borderRadius: '12px',
    maxWidth: '600px',
    width: '90%',
    maxHeight: '80vh',
    overflow: 'auto',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '28px',
    cursor: 'pointer',
    color: '#64748b',
  },
  modalDesc: {
    color: '#475569',
    marginBottom: '16px',
  },
  modalStatus: {
    marginBottom: '16px',
    fontSize: '14px',
  },
  updates: {
    marginTop: '20px',
    borderTop: '1px solid #e2e8f0',
    paddingTop: '20px',
  },
  updatesTitle: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '16px',
  },
  updateItem: {
    background: '#f8fafc',
    padding: '12px',
    borderRadius: '6px',
    marginBottom: '12px',
  },
  updateHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
    fontSize: '14px',
  },
  updateDate: {
    color: '#94a3b8',
    fontSize: '12px',
  },
  updateMessage: {
    color: '#475569',
    margin: 0,
  },
};

export default CustomerDashboard;
