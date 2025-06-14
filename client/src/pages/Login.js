import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Container, Form, Button } from 'react-bootstrap';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { user, role, dispatch } = useAuth();
  const navigate = useNavigate();

  // 🔁 Redirect if already logged in
  useEffect(() => {
    if (user && role) {
      if (role === 'traveler') navigate('/traveler');
      else if (role === 'agent') navigate('/agent');
      else if (role === 'admin') navigate('/admin');
    }
  }, [user, role, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/api/auth/login', { email, password });

      dispatch({
        type: 'LOGIN',
        payload: { token: res.data.token, user: res.data.user },
      });

      const userRole = res.data.user.role;
      if (userRole === 'traveler') navigate('/traveler');
      else if (userRole === 'agent') navigate('/agent');
      else if (userRole === 'admin') navigate('/admin');
      else alert('Unknown role. Cannot redirect.');
    } catch (err) {
      alert('Login failed!');
      console.error('Login error:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-5" style={{ maxWidth: '400px' }}>
      <h2 className="mb-4 text-center">Login</h2>
      <Form onSubmit={handleLogin}>
        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            value={email}
            placeholder="Enter your email"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-4">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            value={password}
            placeholder="Enter your password"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Form.Group>

        <Button type="submit" variant="primary" className="w-100" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </Button>
      </Form>
    </Container>
  );
};

export default Login;
