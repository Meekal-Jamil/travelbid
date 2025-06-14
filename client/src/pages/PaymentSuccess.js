import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import Spinner from '../components/Spinner';

const PaymentSuccess = () => {
  const [params] = useSearchParams();
  const bidId = params.get('bidId');

  useEffect(() => {
    const markAsPaid = async () => {
      if (!bidId) return;
      try {
        await api.put(`/api/bids/pay/${bidId}`);
      } catch (err) {
        console.error('Failed to mark bid as paid:', err);
      }
    };

    markAsPaid();
  }, [bidId]);

  return (
    <div className="container mt-5 text-center">
      <h2 className="text-success mb-3">✅ Payment Successful!</h2>
      <p>Your booking has been confirmed. Thank you for using TravelBid.</p>
      <Spinner />
    </div>
  );
};

export default PaymentSuccess;
