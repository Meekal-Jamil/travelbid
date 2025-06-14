import React, { useState } from 'react';
import axios from 'axios';

const BidForm = ({ tripId }) => {
  const [price, setPrice] = useState('');
  const [services, setServices] = useState('');
  const token = localStorage.getItem('token');

  const handleBidSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/bids', { trip: tripId, price, services }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Bid submitted!');
    } catch (err) {
      alert('Failed to submit bid.');
    }
  };

  return (
    <form onSubmit={handleBidSubmit}>
      <input type="number" placeholder="Your Price (PKR)" value={price}
             onChange={(e) => setPrice(e.target.value)} required />
      <textarea placeholder="Your Service Details" value={services}
                onChange={(e) => setServices(e.target.value)} required />
      <button type="submit">Submit Bid</button>
    </form>
  );
};

export default BidForm;
