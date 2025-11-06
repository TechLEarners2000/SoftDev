import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getIdeas, getDevelopers, updateIdea, getIdeaDetail, addUpdate, getStats } from './api';
import { useNavigate } from 'react-router-dom';

const OwnerDashboard = () => {
  const { user, logoutUser } = useAuth();
  const [ideas, setIdeas] = useState([]);
  const [developers, setDevelopers] = useState([]);
  const [stats, setStats] = useState({});
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [updateMessage, setUpdateMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchIdeas();
    fetchDevelopers();
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

  const fetchDevelopers = async () => {
    try {
      const response = await getDevelopers();
      setDevelopers(response.data);
    } catch (error) {
      console.error('Error fetching developers:', error);
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

  const handleAssign = async (ideaId, developerId) => {
    try {
      await updateIdea(ideaId, { assigned_to: developerId, status: 'in_progress' });
      fetchIdeas();
      fetchStats();
    } catch (error) {
      console.error('Error assigning idea:', error);
    }
  };

  const handleStatusChange = async (ideaId, status) => {
    try {
      await updateIdea(ideaId, { status });
      fetchIdeas();
      fetchStats();
      if (selectedIdea && selectedIdea.id === ideaId) {
        const response = await getIdeaDetail(ideaId);
        setSelectedIdea(response.data);
      }
    } catch (error) {
      console.error('Error updating status:', error);
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

  const handleAddUpdate = async (e) => {
    e.preventDefault();
    if (!updateMessage.trim()) return;
    
    try {
      await addUpdate(selectedIdea.id, updateMessage);
      setUpdateMessage('');
      const response = await getIdeaDetail(selectedIdea.id);
      setSelectedIdea(response.data);
    } catch (error) {
      console.error('Error adding update:', error);
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
        <h1 style={styles.logo}>Owner Dashboard</h1>
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

        <h2 style={styles.title}>All Submitted Ideas</h2>
        
        <div style={styles.ideasList}>
          {ideas.map((idea) => (
            <div key={idea.id} style={styles.ideaCard}>
              <div style={styles.ideaHeader}>
                <div>
                  <h3 style={styles.ideaTitle}>{idea.title}</h3>
                  <p style={styles.ideaCustomer}>Customer: {idea.user_name} ({idea.user_email})</p>
                </div>
                <span style={{...styles.badge, background: getStatusColor(idea.status)}}>
                  {idea.status}
                </span>
              </div>
              <p style={styles.ideaDesc}>{idea.description}</p>
              <div style={styles.ideaActions}>
                <select
                  onChange={(e) => handleAssign(idea.id, parseInt(e.target.value))}
                  style={styles.select}
                  value={idea.assigned_to || ''}
                >
                  <option value="">Assign to Developer</option>
                  {developers.map((dev) => (
                    <option key={dev.id} value={dev.id}>
                      {dev.name}
                    </option>
                  ))}
                </select>
                <select
                  onChange={(e) => handleStatusChange(idea.id, e.target.value)}
                  style={styles.select}
                  value={idea.status}
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
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
              <div style={styles.modalInfo}>
                <p><strong>Customer:</strong> {selectedIdea.user_name}</p>
                <p><strong>Email:</strong> {selectedIdea.user_email}</p>
                <p><strong>Phone:</strong> {selectedIdea.user_phone}</p>
                <p><strong>Status:</strong> <span style={{color: getStatusColor(selectedIdea.status)}}>{selectedIdea.status}</span></p>
              </div>
              <p style={styles.modalDesc}>{selectedIdea.description}</p>
              
              {selectedIdea.updates && selectedIdea.updates.length > 0 && (
                <div style={styles.updates}>
                  <h3 style={styles.updatesTitle}>Progress Updates</h3>
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

              <form onSubmit={handleAddUpdate} style={styles.updateForm}>
                <textarea
                  placeholder="Add an update for the customer..."
                  value={updateMessage}
                  onChange={(e) => setUpdateMessage(e.target.value)}
                  style={styles.textarea}
                  rows="3"
                />
                <button type="submit" style={styles.submitBtn}>Post Update</button>
              </form>
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
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: '20px',
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
    margin: '0 0 4px 0',
  },
  ideaCustomer: {
    fontSize: '14px',
    color: '#64748b',
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
  ideaActions: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },
  select: {
    padding: '8px 12px',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer',
  },
  viewBtn: {
    padding: '8px 16px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
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
    maxWidth: '700px',
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
  modalInfo: {
    background: '#f8fafc',
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '16px',
  },
  modalDesc: {
    color: '#475569',
    marginBottom: '16px',
  },
  updates: {
    marginBottom: '20px',
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
  updateForm: {
    borderTop: '1px solid #e2e8f0',
    paddingTop: '20px',
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
    padding: '10px 20px',
    background: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
  },
};

export default OwnerDashboard;
