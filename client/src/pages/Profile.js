import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Form, Container } from 'react-bootstrap';

const Profile = () => {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const token = localStorage.getItem('token');

  const fetchProfile = async () => {
    try {
      const res = await axios.get('/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFormData({ name: res.data.name, email: res.data.email });
    } catch (err) {
      alert('Failed to load profile');
    }
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    try {
      await axios.put('/api/auth/profile', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Profile updated!');
    } catch (err) {
      alert('Update failed');
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <Container className="mt-4">
      <h2>Profile</h2>
      <Form onSubmit={updateProfile}>
        <Form.Group className="mb-3">
          <Form.Label>Name</Form.Label>
          <Form.Control
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            disabled
          />
        </Form.Group>
        <Button variant="primary" type="submit">Update Profile</Button>
      </Form>
    </Container>
  );
};

export default Profile;
