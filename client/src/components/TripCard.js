import React from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { FaCalendarAlt, FaMapMarkerAlt, FaUser, FaDollarSign } from 'react-icons/fa';

const TripCard = ({ trip, onViewDetails, onBookNow, userRole }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!trip) return null;

  const hasBidFromCurrentAgent = trip.bids?.some(bid => 
    bid.agent === localStorage.getItem('userId') && bid.status === 'pending'
  );

  const getStatusBadge = () => {
    if (trip.status !== 'open') {
      return <Badge bg="secondary">{trip.status}</Badge>;
    }
    if (userRole === 'agent' && hasBidFromCurrentAgent) {
      return <Badge bg="info">Bid Posted</Badge>;
    }
    return <Badge bg="success">Open</Badge>;
  };

  return (
    <Card className="h-100 fade-in">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <Card.Title className="mb-1">{trip.title || 'Untitled Trip'}</Card.Title>
            <Card.Subtitle className="text-muted mb-2">
              <FaUser className="me-1" />
              {trip.traveler?.name || 'Unknown Traveler'}
            </Card.Subtitle>
          </div>
          {getStatusBadge()}
        </div>

        <hr/> 

        <div className="mb-3">
          <p className="mb-2">
            <FaMapMarkerAlt className="me-2 font-icons" />
            {trip.destination || 'No destination specified'}
          </p>
          <p className="mb-2">
            <FaCalendarAlt className="me-2 font-icons" />
            {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
          </p>
          <p className="mb-0">
            <FaDollarSign className="me-2 font-icons" />
            Budget: Rs. {trip.budget || '0'}
          </p>
        </div>

        <Card.Text className="mb-3">
          {trip.description ? (
            trip.description.length > 150
              ? `${trip.description.substring(0, 150)}...`
              : trip.description
          ) : (
            'No description available'
          )}
        </Card.Text>

        <hr/> 

        <div className="d-flex mb-0 pb-0">
          <Button
            variant="outline-primary"
            className="flex-grow-1"
            onClick={() => onViewDetails(trip)}
          >
            View Details
          </Button>
          {userRole === 'agent' && trip.status === 'open' && !hasBidFromCurrentAgent && (
            <Button
              variant="primary"
              className="flex-grow-1"
              onClick={() => onBookNow(trip)}
            >
              Book Now
            </Button>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default TripCard; 