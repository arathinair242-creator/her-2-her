import React, { useState, useEffect, useRef } from 'react';
import { X, CreditCard, ShieldCheck, CheckCircle, AlertCircle, Loader2, IndianRupee, Calendar, Clock } from 'lucide-react';
import { paymentApi } from '../api/apiClient';

export default function BookingCheckoutModal({ isOpen, onClose, bookingDetails, onPaymentSuccess }) {
  const [step, setStep] = useState('processing'); // processing, success, failed
  const [paymentId, setPaymentId] = useState('');
  const [errorReason, setErrorReason] = useState('');
  const launchedRef = useRef(false);

  useEffect(() => {
    if (isOpen && bookingDetails && !launchedRef.current) {
      launchedRef.current = true;
      launchRazorpay();
    }
    if (!isOpen) {
      launchedRef.current = false;
      setStep('processing');
      setPaymentId('');
      setErrorReason('');
    }
  }, [isOpen, bookingDetails]);


  const launchRazorpay = async () => {
    setStep('processing');
    setErrorReason('');
    let paymentProcessed = false;

    try {
      // Step 1: Create Razorpay order via backend
      console.log('[PAYMENT FLOW] Step 3: Creating Razorpay order...', bookingDetails);
      const orderData = await paymentApi.createOrder({
        itemType: 'Consultation',
        itemId: bookingDetails.consultationId,
        amount: bookingDetails.amount,
        expertId: bookingDetails.expertId,
      });
      console.log('[PAYMENT FLOW] Step 3 SUCCESS: Order created:', orderData);

      // Safety check for keyId
      if (!orderData.keyId || !orderData.razorpayOrderId) {
        throw new Error('Invalid order response from server. Missing keyId or razorpayOrderId.');
      }

      // Step 2: Open Razorpay Checkout popup immediately
      console.log('[PAYMENT FLOW] Step 4: Opening Razorpay Checkout popup...');
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'HER2HER',
        description: `Consultation with ${bookingDetails.expertName}`,
        order_id: orderData.razorpayOrderId,
        handler: async function (response) {
          paymentProcessed = true;
          // Step 3: Verify payment on backend
          console.log('[PAYMENT FLOW] Step 5: Payment captured by Razorpay. Verifying...', response);
          try {
            const verifyResult = await paymentApi.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: orderData.orderId,
              consultationId: bookingDetails.consultationId,
            });
            console.log('[PAYMENT FLOW] Step 5 RESULT:', verifyResult);

            if (verifyResult.success) {
              console.log('[PAYMENT FLOW] Step 6: Payment verified ✅. Appointment confirmed.');
              setPaymentId(response.razorpay_payment_id);
              setStep('success');
            } else {
              console.error('[PAYMENT FLOW] Step 5 FAILED: Signature mismatch.');
              setErrorReason('Payment signature verification failed. Please contact support.');
              setStep('failed');
            }
          } catch (err) {
            console.error('[PAYMENT FLOW] Step 5 ERROR:', err);
            setErrorReason('Verification error: ' + (err.message || 'Unknown error'));
            setStep('failed');
          }
        },
        prefill: {
          name: bookingDetails.userName || '',
          email: bookingDetails.userEmail || '',
        },
        theme: {
          color: '#E91E6D',
        },
        modal: {
          ondismiss: function () {
            if (paymentProcessed) {
              console.log('[PAYMENT FLOW] Razorpay popup dismissed after successful processing. Ignoring.');
              return;
            }
            console.log('[PAYMENT FLOW] Razorpay popup dismissed by user.');
            setErrorReason('Payment was cancelled. You can retry anytime.');
            setStep('failed');
          },
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on('payment.failed', function (response) {
        if (paymentProcessed) return;
        console.error('[PAYMENT FLOW] payment.failed event:', response.error);
        setErrorReason(`Payment failed: ${response.error.description} (Code: ${response.error.code})`);
        setStep('failed');
      });

      rzp.open();
    } catch (error) {
      console.error('[PAYMENT FLOW] ERROR creating order:', error);
      setErrorReason('Could not create payment order: ' + (error.message || 'Server error'));
      setStep('failed');
    }
  };


  const handleClose = () => {
    const isSuccess = step === 'success';
    setStep('processing');
    setPaymentId('');
    setErrorReason('');
    launchedRef.current = false;
    onClose();
    if (isSuccess && onPaymentSuccess) {
      onPaymentSuccess({
        transactionId: paymentId,
        status: 'Captured',
      });
    }
  };


  if (!isOpen || !bookingDetails) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: 3000 }}>
      <div className="modal-container glass-card" style={{ maxWidth: '420px', width: '95%', padding: 0, overflow: 'hidden' }}>

        {step === 'processing' && (
          <div className="modal-body" style={{ padding: '40px 24px', textAlign: 'center' }}>
            <Loader2 className="animate-spin" size={48} color="var(--primary-pink)" style={{ margin: '0 auto 20px', animation: 'spin 1s linear infinite' }} />
            <h3 style={{ fontWeight: 800, marginBottom: '10px' }}>Opening Payment Gateway...</h3>
            <p style={{ color: 'var(--text-gray)', fontSize: '0.9rem' }}>Please complete payment in the Razorpay popup window.</p>
          </div>
        )}

        {step === 'success' && (
          <div className="modal-body" style={{ padding: '24px' }}>
            <div style={{ textAlign: 'center', padding: '20px 0', animation: 'scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>
              <div style={{ width: '80px', height: '80px', backgroundColor: '#f0fdf4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <CheckCircle size={48} color="#22c55e" />
              </div>
              <h2 style={{ fontWeight: 900, marginBottom: '10px' }}>Payment Successful!</h2>
              <p style={{ color: 'var(--text-gray)', fontSize: '0.9rem', marginBottom: '15px' }}>
                Your appointment with <strong>{bookingDetails.expertName}</strong> is now confirmed.
              </p>
              <p style={{ color: 'var(--text-gray)', fontSize: '0.85rem', marginBottom: '25px' }}>
                📅 {bookingDetails.date} at {bookingDetails.time}
              </p>
              
              <div style={{ background: 'rgba(0,0,0,0.03)', padding: '15px', borderRadius: '12px', textAlign: 'left', marginBottom: '25px' }}>
                <p style={{ margin: '0 0 5px 0', fontSize: '0.75rem', color: 'var(--text-gray)' }}>Payment ID: {paymentId}</p>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-gray)' }}>Status: <span style={{ color: '#22c55e', fontWeight: 700 }}>Confirmed</span></p>
              </div>

              <button className="btn-primary" onClick={handleClose} style={{ width: '100%', padding: '14px', borderRadius: '12px', fontWeight: 800 }}>
                OK
              </button>
            </div>
          </div>
        )}

        {step === 'failed' && (
          <div className="modal-body" style={{ padding: '24px' }}>
            <div style={{ textAlign: 'center', padding: '20px 0', animation: 'scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>
              <div style={{ width: '80px', height: '80px', backgroundColor: '#fef2f2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <AlertCircle size={48} color="#ef4444" />
              </div>
              <h2 style={{ fontWeight: 900, marginBottom: '10px', color: '#ef4444' }}>Payment Failed</h2>
              <p style={{ color: 'var(--text-gray)', fontSize: '0.9rem', marginBottom: '10px' }}>
                Your payment could not be processed. Your appointment is saved as Pending. You can retry the payment anytime.
              </p>
              {errorReason && (
                <p style={{ color: '#ef4444', fontSize: '0.8rem', background: '#fef2f2', borderRadius: '8px', padding: '8px 12px', marginBottom: '20px', textAlign: 'left' }}>
                  ⚠️ {errorReason}
                </p>
              )}

              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn-primary" onClick={() => { launchedRef.current = false; launchRazorpay(); }} style={{ flex: 1, padding: '14px', borderRadius: '12px', fontWeight: 800 }}>
                  Retry Payment
                </button>
                <button className="btn-modal-cancel" onClick={handleClose} style={{ flex: 1, padding: '14px', borderRadius: '12px', fontWeight: 700 }}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
