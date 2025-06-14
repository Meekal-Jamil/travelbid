import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Card, Modal } from 'react-bootstrap';

const TravelerDashboard = () => {
  const [trips, setTrips] = useState([]);
  const [bids, setBids] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [show, setShow] = useState(false);
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

  const fetchBids = async (tripId) => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/bids/${tripId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBids(res.data);
      setSelectedTripId(tripId);
      setShow(true);
    } catch (err) {
      console.error('Error fetching bids', err);
    }
  };

  const acceptBid = async (bidId) => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/bids/accept/${bidId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchBids(selectedTripId);
    } catch (err) {
      console.error('Error accepting bid', err);
    }
  };

  const rejectBid = async (bidId) => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/bids/reject/${bidId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchBids(selectedTripId);
    } catch (err) {
      console.error('Error rejecting bid', err);
    }
  };

  const confirmPayment = async (bidId) => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/bids/pay/${bidId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
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
      <h2>Your Trips</h2>
      <div className="row">
        {trips.map(trip => (
          <div className="col-md-4" key={trip._id}>
            <Card className="mb-3">
              <Card.Body>
                <Card.Title>{trip.destination}</Card.Title>
                <Card.Text><b>Budget:</b> Rs. {trip.budget}</Card.Text>
                <Card.Text><b>Preferences:</b> {trip.preferences}</Card.Text>
                <Button variant="primary" onClick={() => fetchBids(trip._id)}>View Bids</Button>
              </Card.Body>
            </Card>
          </div>
        ))}
      </div>

      {/* Bids Modal */}
      <Modal show={show} onHide={() => setShow(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Bids for Trip</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {bids.length === 0 ? <p>No bids yet.</p> : bids.map(bid => (
            <Card key={bid._id} className="mb-3">
              <Card.Body>
                <Card.Text><b>Agent:</b> {bid.agent.name}</Card.Text>
                <Card.Text><b>Price:</b> Rs. {bid.price}</Card.Text>
                <Card.Text><b>Service:</b> {bid.services}</Card.Text>
                <Card.Text><b>Status:</b> {bid.status}</Card.Text>
                <Card.Text><b>Payment:</b> {bid.paymentStatus}</Card.Text>

                {bid.status === 'accepted' && bid.paymentStatus === 'unpaid' && (
                  <Button variant="warning" className="me-2" onClick={() => confirmPayment(bid._id)}>
                    Confirm & Pay
                  </Button>
                )}
                {bid.paymentStatus === 'paid' && (
                  <div className="text-success"><b>Booking Confirmed ✅</b></div>
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
          ))}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default TravelerDashboard;
