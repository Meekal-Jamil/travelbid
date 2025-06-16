import React from 'react';
import { Navbar, Nav, Button } from 'react-bootstrap';
import { Link, useNavigate, NavLink } from 'react-router-dom';
import { FaUser, FaSignOutAlt, FaChartBar, FaInbox, FaPlusCircle  } from 'react-icons/fa';
import '../styles/navbar.css';
import logo from '../images/logo.png';

const NavigationBar = ({ isAuthenticated, userRole, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <Navbar expand="lg" className="flex-column custom-vertical-navbar shadow">
      <Navbar.Brand 
        as={Link} 
        to="/" 
        className="text-center py-0 my-2 w-100 d-flex align-items-center justify-content-center"
        style={{ marginBottom: '0px', fontWeight: '600' }}
      >
        <img
          src={logo}
          alt="TravelBid Logo"
          style={{ height: '40px', marginRight: '10px' }}
        />
        TravelBid
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="navbar-collapse" className="mb-2 align-self-end me-" />
      <Navbar.Collapse id="navbar-collapse" className="w-100 nav-inner-navlinks">
        <Nav className="flex-column w-100">
          {isAuthenticated && (
            <>
              <hr className="mt-0 mb-2 mx-3" />
              <Nav.Link as={NavLink} to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
                <FaChartBar style={{ marginRight: '0.5rem' }} /> Dashboard
              </Nav.Link>

              <Nav.Link as={NavLink} to="/inbox" className={({ isActive }) => (isActive ? 'active' : '')}>
                <FaInbox style={{ marginRight: '0.5rem' }} /> Inbox
              </Nav.Link>

              {userRole === 'traveler' && (
                <Nav.Link as={NavLink} to="/post-trip" className={({ isActive }) => (isActive ? 'active' : '')}>
                  <FaPlusCircle style={{ marginRight: '0.5rem' }} /> Post Trip
                </Nav.Link>
              )}
            </>
          )}
        </Nav>
        <Nav className="flex-column w-100 mt-auto pb-3">
          {isAuthenticated ? (
            <>
              <hr className="mx-3" />
              <Nav.Link as={NavLink} to="/profile" className={({ isActive }) => isActive ? 'active' : ''}>
                <FaUser style={{ marginRight: '0.5rem' }} />
                Profile
              </Nav.Link>
              <Button 
                className="btn-logout mx-3 mt-2 shadow" // Custom logout button style
                onClick={handleLogout}
              >
                <FaSignOutAlt className="text-dark me-1" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Nav.Link as={NavLink} to="/login" className={({ isActive }) => isActive ? 'active' : ''}>Login</Nav.Link>
              <Nav.Link as={NavLink} to="/register" className={({ isActive }) => isActive ? 'active' : ''}>Register</Nav.Link>
            </>
          )}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default NavigationBar;