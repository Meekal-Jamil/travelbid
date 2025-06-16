import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Form, Modal, Alert, Badge } from 'react-bootstrap';
import { FaCalendarAlt, FaMapMarkerAlt, FaUser, FaDollarSign, FaCheck, FaTimes } from 'react-icons/fa';
import axios from '../utils/axios';
import PaymentModal from '../components/PaymentModal';

const TripDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBidModal, setShowBidModal] = useState(false);
  const [bidForm, setBidForm] = useState({
    price: '',
    services: ''
  });
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole'));
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBid, setSelectedBid] = useState(null);

  useEffect(() => {
    fetchTripDetails();
  }, [id]);

  const fetchTripDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/trips/${id}`);
      setTrip(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching trip:', err);
      setError('Failed to fetch trip details');
    } finally {
      setLoading(false);
    }
  };

  const handleBidSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`/api/trips/${id}/bid`, bidForm);
      setShowBidModal(false);
      fetchTripDetails(); // Refresh trip details to show new bid
      setBidForm({ price: '', services: '' });
    } catch (err) {
      console.error('Error submitting bid:', err);
      setError('Failed to submit bid');
    }
  };

  const handleBidAction = async (bidId, action) => {
    try {
      await axios.put(`/api/trips/${id}/bid/${bidId}`, { action });
      fetchTripDetails(); // Refresh trip details after bid action
    } catch (err) {
      console.error('Error processing bid:', err);
      setError('Failed to process bid action');
    }
  };

  const handleAcceptBid = (bid) => {
    setSelectedBid(bid);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    fetchTripDetails(); // Refresh trip data
    navigate('/traveler/dashboard'); // Redirect to dashboard
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Container className="py-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  if (!trip) {
    return (
      <Container className="py-4">
        <Alert variant="warning">Trip not found</Alert>
      </Container>
    );
  }

  const hasBidFromCurrentAgent = trip.bids?.some(bid => 
    bid.agent === localStorage.getItem('userId') && bid.status === 'pending'
  );

  return (
    <Container className="py-4">
      <Row>
        <Col lg={8}>
          <Card className="mb-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <Card.Title>{trip.title}</Card.Title>
                  <Card.Subtitle className="text-muted">
                    <FaUser className="me-1" />
                    {trip.traveler?.name}
                  </Card.Subtitle>
                </div>
                <Badge bg={trip.status === 'open' ? 'success' : 'secondary'}>
                  {trip.status}
                </Badge>
              </div>

              <div className="mb-4">
                <p className="mb-2">
                  <FaMapMarkerAlt className="me-2 text-primary" />
                  {trip.destination}
                </p>
                <p className="mb-2">
                  <FaCalendarAlt className="me-2 text-primary" />
                  {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                </p>
                <p className="mb-0">
                  <FaDollarSign className="me-2 text-primary" />
                  Budget: PKR {trip.budget}
                </p>
              </div>

              <Card.Text>{trip.description}</Card.Text>

              {userRole === 'agent' && trip.status === 'open' && !hasBidFromCurrentAgent && (
                <Button
                  variant="primary"
                  onClick={() => setShowBidModal(true)}
                  className="mt-3"
                >
                  Place Bid
                </Button>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          {userRole === 'traveler' && trip.bids && trip.bids.length > 0 && (
            <Card>
              <Card.Header>Bids Received</Card.Header>
              <Card.Body>
                {trip.bids.map((bid) => (
                  <div key={bid._id} className="mb-3 p-3 border rounded">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6 className="mb-0">PKR {bid.price}</h6>
                      <Badge bg={bid.status === 'pending' ? 'warning' : bid.status === 'accepted' ? 'success' : 'danger'}>
                        {bid.status}
                      </Badge>
                    </div>
                    <p className="mb-2">{bid.services}</p>
                    {bid.status === 'pending' && (
                      <div className="d-flex gap-2">
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleAcceptBid(bid)}
                        >
                          Accept & Pay
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleBidAction(bid._id, 'reject')}
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>

      {/* Bid Modal */}
      <Modal show={showBidModal} onHide={() => setShowBidModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Place Bid</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleBidSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Price (PKR)</Form.Label>
              <Form.Control
                type="number"
                value={bidForm.price}
                onChange={(e) => setBidForm({ ...bidForm, price: e.target.value })}
                required
                min="0"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Services Offered</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={bidForm.services}
                onChange={(e) => setBidForm({ ...bidForm, services: e.target.value })}
                required
                placeholder="Describe the services you will provide..."
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowBidModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Submit Bid
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <PaymentModal
        show={showPaymentModal}
        onHide={() => setShowPaymentModal(false)}
        bidId={selectedBid?._id}
        tripId={trip._id}
        amount={selectedBid?.price}
        onSuccess={handlePaymentSuccess}
      />
    </Container>
  );
};

export default TripDetails; 