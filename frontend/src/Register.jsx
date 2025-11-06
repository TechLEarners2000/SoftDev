import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from './api';
import { useAuth } from './AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'customer',
    secretKey: ''
  });

  const [showOwner, setShowOwner] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({ ...formData, [name]: value });

    // Reveal owner role if secret key matches *your personal key*
    if (name === 'secretKey') {
      if (value === import.meta.env.VITE_OWNER_SECRET) {
        setShowOwner(true);
      } else {
        setShowOwner(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await register(formData);
      loginUser(response.data.user, response.data.access_token);

      if (response.data.user.role === 'customer') {
        navigate('/customer');
      } else if (response.data.user.role === 'developer') {
        navigate('/developer');
      } else if (response.data.user.role === 'owner') {
        navigate('/owner');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create Account</h2>

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* name */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          {/* email */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          {/* phone */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          {/* password */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          {/* secret key for owner */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Secret Key (only for owner)</label>
            <input
              type="password"
              name="secretKey"
              value={formData.secretKey}
              onChange={handleChange}
              style={styles.input}
              placeholder="Leave empty unless you're owner"
            />
          </div>

          {/* role selection */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Register as</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              style={styles.input}
            >
              <option value="customer">Customer</option>
              <option value="developer">Developer</option>

              <option value="owner">Owner</option>
            </select>
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <button type="submit" style={styles.button}>Register</button>
        </form>

        <p style={styles.link}>
          Already have an account? <a href="/" style={styles.linkText}>Login</a>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  },
  card: {
    background: "white",
    padding: "40px",
    borderRadius: "12px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "400px",
  },
  title: {
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom: "24px",
    textAlign: "center",
    color: "#334155",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#475569",
  },
  input: {
    padding: "10px 12px",
    border: "1px solid #cbd5e1",
    borderRadius: "6px",
    fontSize: "14px",
  },
  button: {
    padding: "12px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "8px",
  },
  error: {
    color: "#ef4444",
    fontSize: "14px",
    textAlign: "center",
  },
  link: {
    textAlign: "center",
    marginTop: "16px",
    fontSize: "14px",
    color: "#64748b",
  },
  linkText: {
    color: "#667eea",
    textDecoration: "none",
    fontWeight: "600",
  },
};

export default Register;
