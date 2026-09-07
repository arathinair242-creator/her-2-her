import React, { useState, useEffect } from 'react';
import { IndianRupee, Calendar, Clock, User, FileText, Activity } from 'lucide-react';
import { userApi } from '../api/apiClient';

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await userApi.getMyOrders();
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Captured':
        return <span style={{ color: '#10b981', background: '#ecfdf5', padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700 }}>PAID</span>;
      case 'Failed':
        return <span style={{ color: '#ef4444', background: '#fef2f2', padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700 }}>FAILED</span>;
      case 'Refunded':
        return <span style={{ color: '#6366f1', background: '#eef2ff', padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700 }}>REFUNDED</span>;
      default:
        return <span style={{ color: '#f59e0b', background: '#fffbeb', padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700 }}>PENDING</span>;
    }
  };

  const getExpertName = (order) => {
    if (order.expertId?.name) return order.expertId.name;
    if (order.partnerId?.businessName) return order.partnerId.businessName;
    if (order.partnerId?.name) return order.partnerId.name;
    return 'N/A';
  };

  const getItemLabel = (order) => {
    if (order.itemType === 'Consultation') {
      const specialty = order.expertId?.specialty || '';
      return specialty ? `${specialty} Consultation` : 'Consultation';
    }
    return order.itemType || 'Booking';
  };

  return (
    <div className="glass-card" style={{ padding: '30px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '30px', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '20px' }}>
        <div style={{ background: 'var(--primary-pink-light)', padding: '10px', borderRadius: '12px' }}>
          <FileText color="var(--primary-pink)" size={24} />
        </div>
        <div>
          <h3 style={{ margin: 0, fontWeight: 900 }}>Payments &amp; Bookings</h3>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-gray)' }}>Track your session history and transaction details</p>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
          <Activity className="animate-pulse-soft" style={{ color: 'var(--primary-pink)' }} size={36} />
        </div>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-gray)' }}>
          <FileText size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
          <p style={{ fontWeight: 600 }}>No payment records found.</p>
          <p style={{ fontSize: '0.85rem' }}>Book a session to see your history here.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {orders.map((order) => (
            <div key={order._id} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '20px', padding: '20px', borderRadius: '20px', backgroundColor: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h4 style={{ margin: 0, fontWeight: 800 }}>{getItemLabel(order)}</h4>
                  {getStatusBadge(order.status)}
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', fontSize: '0.8rem', color: 'var(--text-gray)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <User size={14} /> {getExpertName(order)}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Calendar size={14} /> {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                  {(order.razorpayPaymentId || order.transactionId) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Clock size={14} /> ID: {order.razorpayPaymentId || order.transactionId}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-dark)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                  <IndianRupee size={16} /> {order.amount}
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-gray)', marginTop: '4px' }}>{order.currency || 'INR'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
