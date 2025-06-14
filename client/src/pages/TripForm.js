import React, { useState } from 'react';
import axios from 'axios';

const TripForm = () => {
  const [formData, setFormData] = useState({
    destination: '', startDate: '', endDate: '', budget: '', preferences: ''
  });

  const token = localStorage.getItem('token');

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await axios.post('/api/trips', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Trip posted successfully!');
    } catch (err) {
      alert('Trip post failed!');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Post a Trip</h2>
      <select name="destination" onChange={handleChange} required>
        <option value="">Select a City</option>
        <option value="Islamabad">Islamabad</option>
        <option value="Lahore">Lahore</option>
        <option value="Karachi">Karachi</option>
        <option value="Multan">Multan</option>
      </select>
      <input name="startDate" type="date" onChange={handleChange} required />
      <input name="endDate" type="date" onChange={handleChange} required />
      <input name="budget" type="number" placeholder="Budget (PKR)" onChange={handleChange} required />
      <textarea name="preferences" placeholder="Preferences..." onChange={handleChange}></textarea>
      <button type="submit">Post Trip</button>
    </form>
  );
};

export default TripForm;
