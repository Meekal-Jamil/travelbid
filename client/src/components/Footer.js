import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-dark text-light py-4 mt-auto">
      <Container>
        <Row>
          <Col md={4} className="mb-3">
            <h5>TravelBid</h5>
            <p className="text-muted">
              Your trusted platform for connecting travelers with local travel agents.
            </p>
          </Col>
          <Col md={4} className="mb-3">
            <h5>Quick Links</h5>
            <ul className="list-unstyled">
              <li><a href="/" className="text-muted text-decoration-none">Home</a></li>
              <li><a href="/about" className="text-muted text-decoration-none">About Us</a></li>
              <li><a href="/contact" className="text-muted text-decoration-none">Contact</a></li>
              <li><a href="/terms" className="text-muted text-decoration-none">Terms & Conditions</a></li>
            </ul>
          </Col>
          <Col md={4} className="mb-3">
            <h5>Connect With Us</h5>
            <div className="d-flex gap-3">
              <a href="#" className="text-light"><FaFacebook size={24} /></a>
              <a href="#" className="text-light"><FaTwitter size={24} /></a>
              <a href="#" className="text-light"><FaInstagram size={24} /></a>
              <a href="#" className="text-light"><FaLinkedin size={24} /></a>
            </div>
          </Col>
        </Row>
        <hr className="my-3" />
        <Row>
          <Col className="text-center text-muted">
            <small>&copy; {new Date().getFullYear()} TravelBid. All rights reserved.</small>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer; 