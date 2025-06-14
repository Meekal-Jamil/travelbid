import React, { useEffect, useState } from 'react';
import { Button, Card, Modal } from 'react-bootstrap';
import Spinner from '../components/Spinner';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const TravelerDashboard = () => {
  const [trips, setTrips] = useState([]);
  const [bids, setBids] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingBids, setLoadingBids] = useState(false);
  const { token } = useAuth();
  const navigate = useNavigate();

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/trips');
      setTrips(res.data);
    } catch (err) {
      console.error('Error fetching trips', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBids = async (tripId) => {
    try {
      setLoadingBids(true);
      const res = await api.get(`/api/bids/${tripId}`);
      setBids(res.data);
      setSelectedTripId(tripId);
      setShow(true);
    } catch (err) {
      console.error('Error fetching bids', err);
    } finally {
      setLoadingBids(false);
    }
  };

  const acceptBid = async (bidId) => {
    try {
      await api.put(`/api/bids/accept/${bidId}`);
      fetchBids(selectedTripId);
    } catch (err) {
      console.error('Error accepting bid', err);
    }
  };

  const rejectBid = async (bidId) => {
    try {
      await api.put(`/api/bids/reject/${bidId}`);
      fetchBids(selectedTripId);
    } catch (err) {
      console.error('Error rejecting bid', err);
    }
  };

  const confirmPayment = async (bidId) => {
    try {
      await api.put(`/api/bids/pay/${bidId}`);
      fetchBids(selectedTripId);
      alert('Payment successful. Booking confirmed!');
    } catch (err) {
      console.error('Error confirming payment', err);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="m-0">Your Trips</h2>
        <Button variant="success" onClick={() => navigate('/post-trip')}>
          Post New Trip
        </Button>
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <div className="row">
          {trips.length === 0 ? (
            <p className="text-center">No trips found. Post one!</p>
          ) : (
            trips.map((trip) => (
              <div className="col-lg-4 col-md-6 mb-3" key={trip._id}>
                <Card className="h-100 shadow-sm">
                  <Card.Body>
                    <Card.Title>{trip.destination}</Card.Title>
                    <Card.Text><strong>Budget:</strong> Rs. {trip.budget}</Card.Text>
                    <Card.Text><strong>Preferences:</strong> {trip.preferences}</Card.Text>
                    <Button variant="primary" onClick={() => fetchBids(trip._id)}>
                      View Bids
                    </Button>
                  </Card.Body>
                </Card>
              </div>
            ))
          )}
        </div>
      )}

      {/* Bids Modal */}
      <Modal show={show} onHide={() => setShow(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Bids for Trip</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loadingBids ? (
            <Spinner />
          ) : bids.length === 0 ? (
            <p>No bids yet.</p>
          ) : (
            bids.map((bid) => (
              <Card key={bid._id} className="mb-3 shadow-sm">
                <Card.Body>
                  <Card.Text><strong>Agent:</strong> {bid.agent.name}</Card.Text>
                  <Card.Text><strong>Price:</strong> Rs. {bid.price}</Card.Text>
                  <Card.Text><strong>Service:</strong> {bid.services}</Card.Text>
                  <Card.Text><strong>Status:</strong> {bid.status}</Card.Text>
                  <Card.Text><strong>Payment:</strong> {bid.paymentStatus}</Card.Text>

                  {bid.status === 'accepted' && bid.paymentStatus === 'unpaid' && (
                    <Button variant="warning" className="me-2" onClick={() => confirmPayment(bid._id)}>
                      Confirm & Pay
                    </Button>
                  )}

                  {bid.paymentStatus === 'paid' && (
                    <div className="text-success"><strong>Booking Confirmed ✅</strong></div>
                  )}

                  {bid.status === 'pending' && (
                    <>
                      <Button variant="success" className="me-2" onClick={() => acceptBid(bid._id)}>
                        Accept
                      </Button>
                      <Button variant="danger" onClick={() => rejectBid(bid._id)}>
                        Reject
                      </Button>
                    </>
                  )}
                </Card.Body>
              </Card>
            ))
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default TravelerDashboard;
