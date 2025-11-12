/**
 * Payment Form Component
 * Handles Stripe payment processing for projects
 *
 * Prerequisites:
 * - Install: npm install @stripe/stripe-js @stripe/react-stripe-js
 * - Add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to .env.local
 */
import React, { useState, useEffect } from 'react';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { paymentsAPI } from '@/lib/api';

// Load Stripe
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
);

interface PaymentFormProps {
  projectId: number;
  amount: number;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

interface CheckoutFormProps {
  amount: number;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

// Inner form component that uses Stripe hooks
const CheckoutForm: React.FC<CheckoutFormProps> = ({
  amount,
  onSuccess,
  onError,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Confirm payment with Stripe
      const { error: stripeError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
      });

      if (stripeError) {
        setError(stripeError.message || 'Payment failed');
        onError?.(stripeError.message || 'Payment failed');
      } else {
        onSuccess?.();
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Payment failed';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Payment Details</h3>

        <div className="mb-4">
          <div className="text-sm text-gray-600 mb-2">Amount to Pay</div>
          <div className="text-2xl font-bold text-gray-900">${amount.toFixed(2)}</div>
          <div className="text-xs text-gray-500 mt-1">
            Platform fee (0.1%): ${(amount * 0.001).toFixed(2)}
          </div>
        </div>

        <PaymentElement />

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={!stripe || loading}
          className={`
            mt-6 w-full py-3 px-4 rounded-md font-semibold text-white
            transition-colors duration-200
            ${
              !stripe || loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }
          `}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            `Pay $${amount.toFixed(2)}`
          )}
        </button>

        <div className="mt-4 text-xs text-gray-500 text-center">
          Your payment is secure and encrypted. Funds will be held in escrow until project completion.
        </div>
      </div>
    </form>
  );
};

// Main PaymentForm component
export const PaymentForm: React.FC<PaymentFormProps> = ({
  projectId,
  amount,
  onSuccess,
  onError,
}) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Create payment intent when component mounts
    const createPaymentIntent = async () => {
      try {
        setLoading(true);
        const response = await paymentsAPI.createIntent({
          project_id: projectId,
          amount: amount,
        });

        setClientSecret(response.data.client_secret);
        setPaymentId(response.data.payment_id);
        setError(null);
      } catch (err: any) {
        const errorMessage = err.response?.data?.detail || 'Failed to initialize payment';
        setError(errorMessage);
        onError?.(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    createPaymentIntent();
  }, [projectId, amount]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !clientSecret) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-md">
        <h3 className="text-lg font-semibold text-red-800 mb-2">Payment Error</h3>
        <p className="text-sm text-red-600">{error || 'Failed to initialize payment'}</p>
      </div>
    );
  }

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#2563eb',
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm
        amount={amount}
        onSuccess={onSuccess}
        onError={onError}
      />
    </Elements>
  );
};

export default PaymentForm;
