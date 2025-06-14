import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      });

      // Save JWT token and user role
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.user.role);

      // Redirect based on role
      if (res.data.user.role === 'traveler') {
        navigate('/traveler');
      } else if (res.data.user.role === 'agent') {
        navigate('/agent');
      } else {
        alert('Unknown role. Cannot redirect.');
      }
    } catch (err) {
      alert('Login failed!');
      console.error('Login error:', err.response?.data || err.message);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <h2>Login</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit">Login</button>
    </form>
  );
};

export default Login;
