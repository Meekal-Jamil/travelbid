import React, { useEffect, useState } from 'react';
import { Card, Container, Form } from 'react-bootstrap';
import api from '../services/api';

const BookingHistory = () => {
  const [bookings, setBookings] = useState([]);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/api/bids/bookings/traveler');
      setBookings(res.data);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    }
  };

  const handleRatingChange = async (bidId, rating) => {
    try {
      await api.put(`/api/bids/rate/${bidId}`, { rating });
      alert('Rating submitted!');
      fetchBookings(); // Refresh to update the rating display
    } catch (err) {
      alert('Failed to submit rating.');
      console.error(err.response?.data || err.message);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  return (
    <Container className="mt-4">
      <h2>Booking History</h2>
      {bookings.length === 0 ? (
        <p>No bookings yet.</p>
      ) : (
        bookings.map(bid => (
          <Card key={bid._id} className="mb-3">
            <Card.Body>
              <h5>Trip: {bid.trip.destination}</h5>
              <p>Agent: {bid.agent.name}</p>
              <p>Paid: Rs. {bid.price}</p>
              <p>Rating: {bid.rating ? `${bid.rating} ⭐` : 'Not rated yet'}</p>

              {/* Rating Input */}
              {bid.rating == null && (
                <Form>
                  <Form.Group className="mb-2">
                    <Form.Label>Rate this Agent (1–5)</Form.Label>
                    <Form.Control
                      type="number"
                      min="1"
                      max="5"
                      placeholder="Enter rating"
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (value >= 1 && value <= 5) {
                          handleRatingChange(bid._id, value);
                        }
                      }}
                    />
                  </Form.Group>
                </Form>
              )}
            </Card.Body>
          </Card>
        ))
      )}
    </Container>
  );
};

export default BookingHistory;
