// ✅ Updated AgentDashboard.js
import React, { useEffect, useState } from 'react';
import { Button, Card, Modal, Form } from 'react-bootstrap';
import Spinner from '../components/Spinner';
import api from '../services/api';

const AgentDashboard = () => {
  const [trips, setTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ price: '', services: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/trips');
      setTrips(res.data);
    } catch (err) {
      console.error('Error fetching trips', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenBidModal = (tripId) => {
    setSelectedTripId(tripId);
    setShowModal(true);
  };

  const handleSubmitBid = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/api/bids', {
        trip: selectedTripId,
        price: form.price,
        services: form.services
      });
      alert('Bid submitted!');
      setShowModal(false);
      setForm({ price: '', services: '' });
    } catch (err) {
      alert('Error submitting bid');
      console.error(err.response?.data || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">Available Trip Requests</h2>
      {loading ? (
        <Spinner />
      ) : (
        <div className="row">
          {trips.map(trip => (
            <div className="col-lg-4 col-md-6 mb-3" key={trip._id}>
              <Card className="h-100 shadow-sm">
                <Card.Body>
                  <Card.Title>{trip.destination}</Card.Title>
                  <Card.Text><strong>Budget:</strong> Rs. {trip.budget}</Card.Text>
                  <Card.Text><strong>Dates:</strong> {trip.startDate?.slice(0, 10)} - {trip.endDate?.slice(0, 10)}</Card.Text>
                  <Card.Text><strong>Preferences:</strong> {trip.preferences}</Card.Text>
                  <Button variant="primary" onClick={() => handleOpenBidModal(trip._id)}>
                    Submit a Bid
                  </Button>
                </Card.Body>
              </Card>
            </div>
          ))}
        </div>
      )}

      {/* Bid Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Submit Your Bid</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmitBid}>
            <Form.Group className="mb-3">
              <Form.Label>Price (PKR)</Form.Label>
              <Form.Control type="number" required
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Services Included</Form.Label>
              <Form.Control as="textarea" rows={3} required
                value={form.services}
                onChange={(e) => setForm({ ...form, services: e.target.value })}
              />
            </Form.Group>
            <Button variant="success" type="submit" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default AgentDashboard;
