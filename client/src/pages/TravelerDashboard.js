import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { FaPlus, FaHistory, FaInbox } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import TripCard from '../components/TripCard';
import SearchBar from '../components/SearchBar';
import axios from '../utils/axios';
import '../styles/custom_btn.css';

const TravelerDashboard = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState({
    destination: '',
    startDate: '',
    endDate: '',
    minBudget: '',
    maxBudget: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/trips');
      setTrips(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching trips:', err);
      setError('Failed to fetch trips. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleViewDetails = (trip) => {
    navigate(`/trip/${trip._id}`);
  };

  const handleCreateTrip = () => {
    navigate('/post-trip');
  };

  const filteredTrips = trips.filter(trip => {
    const matchesDestination = !searchQuery.destination || 
      trip.destination?.toLowerCase().includes(searchQuery.destination.toLowerCase());
    const matchesStartDate = !searchQuery.startDate || 
      new Date(trip.startDate) >= new Date(searchQuery.startDate);
    const matchesEndDate = !searchQuery.endDate || 
      new Date(trip.endDate) <= new Date(searchQuery.endDate);
    const matchesMinBudget = !searchQuery.minBudget || 
      trip.budget >= Number(searchQuery.minBudget);
    const matchesMaxBudget = !searchQuery.maxBudget || 
      trip.budget <= Number(searchQuery.maxBudget);

    return matchesDestination && matchesStartDate && matchesEndDate && 
           matchesMinBudget && matchesMaxBudget;
  });

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

  return (
    <Container >
      <h2 className="mb-4">Traveler Dashboard</h2>

      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

<Row className="g-3 mb-4 mx-3">
        <Col md={4}>
          <Card className="h-100">
            <Card.Body className="text-center">
              <FaPlus size={28} className="font-icons mb-3" />
              <h5>Post New Trip</h5>
              <p className="text-muted">Create a new trip request</p>
              <hr className="mx-3"/>
              <Button className="post-trip-btn" onClick={handleCreateTrip}>
                Create Trip
              </Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100">
            <Card.Body className="text-center">
              <FaHistory size={28} className="font-icons mb-3" />
              <h5>Trip History</h5>
              <p className="text-muted">View your past trips</p>
              <hr className="mx-3"/>
              <Button className="view-history-btn" onClick={() => navigate('/trips/history')}>
                View History
              </Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100">
            <Card.Body className="text-center">
              <FaInbox size={28} className="font-icons mb-3" />
              <h5>Messages</h5>
              <p className="text-muted">Check your messages</p>
              <hr className="mx-3"/>
              <Button className="view-messages-btn" onClick={() => navigate('/inbox')}>
                View Messages
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="mb-0">Your Trips</h4>
            <SearchBar onSearch={handleSearch} />
          </div>

          {filteredTrips.length > 0 ? (
            <Row className="g-4">
              {filteredTrips.map((trip) => (
                <Col key={trip._id} md={6} lg={4}>
                  <TripCard
                    trip={trip}
                    onViewDetails={handleViewDetails}
                    userRole="traveler"
                  />
                </Col>
              ))}
            </Row>
          ) : (
            <Alert variant="info">
              {searchQuery
                ? 'No trips match your search criteria'
                : 'You haven\'t posted any trips yet'}
            </Alert>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default TravelerDashboard;
