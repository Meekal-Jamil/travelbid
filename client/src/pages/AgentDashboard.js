// ✅ Updated AgentDashboard.js
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { FaMoneyBillWave, FaCheckCircle, FaClock, FaChartLine } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import TripCard from '../components/TripCard';
import SearchBar from '../components/SearchBar';
import axios from '../utils/axios';

const AgentDashboard = () => {
  const [trips, setTrips] = useState([]);
  const [stats, setStats] = useState({
    totalBids: 0,
    acceptedBids: 0,
    rejectedBids: 0,
    pendingBids: 0,
    earnings: 0
  });
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
    fetchStats();
    // Set up polling for real-time updates
    const interval = setInterval(fetchStats, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
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

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/agent/stats');
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
      // Don't set error here as it's not critical
    }
  };

  const handleSearch = (filters) => {
    setSearchQuery(filters);
  };

  const handleViewDetails = (trip) => {
    navigate(`/trip/${trip._id}`);
  };

  const handleBookNow = (trip) => {
    navigate(`/trip/${trip._id}`);
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

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <Card className="h-100">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h6 className="text-muted mb-2">{title}</h6>
            <h3 className="mb-0">{value}</h3>
          </div>
          <Icon size={24} className={`text-${color}`} />
        </div>
      </Card.Body>
    </Card>
  );

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
    <Container className="py-4">
      <h2 className="mb-4">Agent Dashboard</h2>

      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      <Row className="g-4 mb-4">
        <Col md={3}>
          <StatCard
            title="Total Bids"
            value={stats.totalBids}
            icon={FaMoneyBillWave}
            color="primary"
          />
        </Col>
        <Col md={3}>
          <StatCard
            title="Accepted Bids"
            value={stats.acceptedBids}
            icon={FaCheckCircle}
            color="success"
          />
        </Col>
        <Col md={3}>
          <StatCard
            title="Earnings"
            value={`PKR ${stats.earnings.toFixed(2)}`}
            icon={FaChartLine}
            color="info"
          />
        </Col>
        <Col md={3}>
          <StatCard
            title="Pending Bids"
            value={stats.pendingBids}
            icon={FaClock}
            color="warning"
          />
        </Col>
      </Row>

      <Card className="mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="mb-0">Available Trips</h4>
            <SearchBar onSearch={handleSearch} />
          </div>

          {filteredTrips.length > 0 ? (
            <Row className="g-4">
              {filteredTrips.map((trip) => (
                <Col key={trip._id} md={6} lg={4}>
                  <TripCard
                    trip={trip}
                    onViewDetails={handleViewDetails}
                    onBookNow={handleBookNow}
                    userRole="agent"
                  />
                </Col>
              ))}
            </Row>
          ) : (
            <Alert variant="info">
              {searchQuery.destination || searchQuery.startDate || searchQuery.endDate || searchQuery.minBudget || searchQuery.maxBudget
                ? 'No trips match your search criteria'
                : 'No trips available at the moment'}
            </Alert>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AgentDashboard;
