import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Card, Modal, Form } from 'react-bootstrap';

const AgentDashboard = () => {
  const [trips, setTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ price: '', services: '' });
  const token = localStorage.getItem('token');

  const fetchTrips = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/trips`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTrips(res.data);
    } catch (err) {
      console.error('Error fetching trips', err);
    }
  };

  const handleOpenBidModal = (tripId) => {
    setSelectedTripId(tripId);
    setShowModal(true);
  };

  const handleSubmitBid = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/bids`, {
        trip: selectedTripId,
        price: form.price,
        services: form.services
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Bid submitted!');
      setShowModal(false);
    } catch (err) {
      alert('Error submitting bid');
      console.error(err.response?.data || err.message);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  return (
    <div className="container mt-4">
      <h2>Available Trip Requests</h2>
      <div className="row">
        {trips.map(trip => (
          <div className="col-md-4" key={trip._id}>
            <Card className="mb-3">
              <Card.Body>
                <Card.Title>{trip.destination}</Card.Title>
                <Card.Text><b>Budget:</b> Rs. {trip.budget}</Card.Text>
                <Card.Text><b>Dates:</b> {trip.startDate?.slice(0, 10)} - {trip.endDate?.slice(0, 10)}</Card.Text>
                <Card.Text><b>Preferences:</b> {trip.preferences}</Card.Text>
                <Button variant="primary" onClick={() => handleOpenBidModal(trip._id)}>
                  Submit a Bid
                </Button>
              </Card.Body>
            </Card>
          </div>
        ))}
      </div>

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
            <Button variant="success" type="submit">Submit</Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default AgentDashboard;
