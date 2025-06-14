import React, { useState } from 'react';
import { Form, Button, Container } from 'react-bootstrap';
import api from '../services/api'; // ✅ Make sure this path is correct
import { useNavigate } from 'react-router-dom';

const TripForm = () => {
  const [formData, setFormData] = useState({
    destination: '',
    startDate: '',
    endDate: '',
    budget: '',
    preferences: ''
  });

  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/trips', formData); // ✅ Automatically attaches token via api.js
      alert('Trip posted successfully!');
      navigate('/traveler');
    } catch (err) {
      alert('Trip post failed!');
      console.error(err.response?.data || err.message);
    }
  };

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Post a Trip</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Destination</Form.Label>
          <Form.Select name="destination" value={formData.destination} onChange={handleChange} required>
            <option value="">Select a City</option>
            <option value="Islamabad">Islamabad</option>
            <option value="Lahore">Lahore</option>
            <option value="Karachi">Karachi</option>
            <option value="Multan">Multan</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Start Date</Form.Label>
          <Form.Control type="date" name="startDate" value={formData.startDate} onChange={handleChange} required />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>End Date</Form.Label>
          <Form.Control type="date" name="endDate" value={formData.endDate} onChange={handleChange} required />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Budget (PKR)</Form.Label>
          <Form.Control type="number" name="budget" placeholder="Budget" value={formData.budget} onChange={handleChange} required />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Preferences</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            name="preferences"
            placeholder="Any preferences?"
            value={formData.preferences}
            onChange={handleChange}
          />
        </Form.Group>

        <Button variant="success" type="submit">Post Trip</Button>
      </Form>
    </Container>
  );
};

export default TripForm;
