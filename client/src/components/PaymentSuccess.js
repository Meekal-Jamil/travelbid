import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { FaCheckCircle } from 'react-icons/fa';
import './PaymentSuccess.css';

const PaymentSuccess = ({ show, onHide }) => {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Body className="text-center p-4">
        <div className="success-animation mb-3">
          <FaCheckCircle className="success-icon" />
        </div>
        <h4 className="mb-3">Payment Successful!</h4>
        <p className="text-muted mb-4">
          Your booking has been confirmed. You can view the details in your booking history.
        </p>
        <Button variant="primary" onClick={onHide}>
          Continue
        </Button>
      </Modal.Body>
    </Modal>
  );
};

export default PaymentSuccess; 