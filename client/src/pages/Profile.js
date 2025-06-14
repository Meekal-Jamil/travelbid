import React, { useEffect, useState } from 'react';
import { Button, Form, Container, Alert } from 'react-bootstrap';
import api from '../services/api';

const Profile = () => {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchProfile = async () => {
    try {
      const res = await api.get('/api/auth/profile');
      setFormData({ name: res.data.name, email: res.data.email });
    } catch (err) {
      setError('Failed to load profile.');
      console.error('Profile fetch error:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    try {
      await api.put('/api/auth/profile', { name: formData.name });
      setSuccessMsg('Profile updated!');
    } catch (err) {
      setError('Update failed.');
      console.error('Profile update error:', err.response?.data || err.message);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) return <div className="text-center mt-5">Loading...</div>;

  return (
    <Container className="mt-4" style={{ maxWidth: '600px' }}>
      <h2 className="mb-4">Profile</h2>

      {error && <Alert variant="danger">{error}</Alert>}
      {successMsg && <Alert variant="success">{successMsg}</Alert>}

      <Form onSubmit={updateProfile}>
        <Form.Group className="mb-3">
          <Form.Label>Name</Form.Label>
          <Form.Control
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control
            value={formData.email}
            disabled
          />
        </Form.Group>

        <Button variant="primary" type="submit">
          Update Profile
        </Button>
      </Form>
    </Container>
  );
};

export default Profile;
