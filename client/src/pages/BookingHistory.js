import React, { useEffect, useState } from 'react';
import { Card, Container, Form, Badge, Alert } from 'react-bootstrap';
import { FaMapMarkerAlt, FaCalendarAlt, FaUser, FaDollarSign } from 'react-icons/fa';
import api from '../services/api';

const BookingHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      console.log('Fetching bookings...');
      const res = await api.get('/api/bids/bookings/traveler');
      console.log('Bookings response:', res.data);
      setBookings(res.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError(err.response?.data?.msg || 'Failed to fetch bookings. Please try again later.');
    } finally {
      setLoading(false);
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  if (loading) {
    return (
      <Container className="mt-4 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Booking History</h2>
      
      {bookings.length === 0 ? (
        <Card>
          <Card.Body className="text-center">
            <p className="mb-0">No bookings yet.</p>
            <p className="mt-2 text-muted">
              You need to create a trip and accept a bid to see bookings here.
            </p>
          </Card.Body>
        </Card>
      ) : (
        bookings.map(bid => (
          <Card key={bid._id} className="mb-3">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h5 className="mb-1">
                    <FaMapMarkerAlt className="me-2 text-primary" />
                    {bid.trip.destination}
                  </h5>
                  <p className="text-muted mb-0">
                    <FaCalendarAlt className="me-2" />
                    {formatDate(bid.trip.startDate)} - {formatDate(bid.trip.endDate)}
                  </p>
                </div>
                {bid.paymentStatus === 'paid' && (
                  <Badge bg="success">Paid</Badge>
                )}
              </div>

              <div className="mb-3">
                <p className="mb-2">
                  <FaUser className="me-2 text-primary" />
                  Agent: {bid.agent.name}
                </p>
                <p className="mb-2">
                  <FaDollarSign className="me-2 text-primary" />
                  Amount: Rs. {bid.price}
                </p>
                <p className="mb-0">
                  Services: {bid.services}
                </p>
              </div>

              {bid.paymentStatus === 'paid' && (
                <div className="mt-3">
                  <p className="mb-2">
                    Rating: {bid.rating ? `${bid.rating} ⭐` : 'Not rated yet'}
                  </p>
                  {!bid.rating && (
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
                </div>
              )}
            </Card.Body>
          </Card>
        ))
      )}
    </Container>
  );
};

export default BookingHistory;
