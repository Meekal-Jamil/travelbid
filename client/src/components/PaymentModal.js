import React, { useState } from 'react';
import { Modal, Button, Alert } from 'react-bootstrap';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import api from '../services/api';
import PaymentSuccess from './PaymentSuccess';

// Initialize Stripe
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

const PaymentForm = ({ bidId, tripId, amount, onSuccess, onClose }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setProcessing(true);

    if (!stripe || !elements) {
      return;
    }

    try {
      // Create payment intent
      const { data: { clientSecret } } = await api.post('/api/payments/create-intent', {
        bidId,
        tripId
      });

      // Confirm the payment
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
          },
        }
      );

      if (stripeError) {
        setError(stripeError.message);
      } else if (paymentIntent.status === 'succeeded') {
        // Handle successful payment
        await api.post('/api/payments/success', {
          bidId,
          tripId
        });
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          onSuccess();
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.msg || 'An error occurred during payment');
    }

    setProcessing(false);
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
          />
        </div>
        {error && <Alert variant="danger">{error}</Alert>}
        <div className="d-flex justify-content-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!stripe || processing}
            variant="primary"
          >
            {processing ? 'Processing...' : `Pay PKR ${amount}`}
          </Button>
        </div>
      </form>

      <PaymentSuccess 
        show={showSuccess} 
        onHide={() => {
          setShowSuccess(false);
          onSuccess();
        }} 
      />
    </>
  );
};

const PaymentModal = ({ show, onHide, bidId, tripId, amount, onSuccess }) => {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Complete Payment</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Elements stripe={stripePromise}>
          <PaymentForm
            bidId={bidId}
            tripId={tripId}
            amount={amount}
            onSuccess={onSuccess}
            onClose={onHide}
          />
        </Elements>
      </Modal.Body>
    </Modal>
  );
};

export default PaymentModal; 