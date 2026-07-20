import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, RefreshCw, ThumbsUp } from 'lucide-react';
import { adminApi } from '../../api/apiClient';

export default function AdminReviews() {
  const [data, setData] = useState({ reviews: [], totalReviews: 0, avgRating: 0 });
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const result = await adminApi.getAllReviews();
      setData(result);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReviews(); }, []);

  const renderStars = (rating) =>
    [...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={14}
        fill={i < rating ? '#FFA620' : 'transparent'}
        color={i < rating ? '#FFA620' : '#d1d5db'}
        style={{ flexShrink: 0 }}
      />
    ));

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div style={{ animation: 'fadeIn 0.5s ease' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1f2937', marginBottom: '4px' }}>
            Customer Reviews
          </h2>
          <p style={{ color: '#6b7280', margin: 0 }}>All feedback submitted by users through the website.</p>
        </div>
        <button
          onClick={fetchReviews}
          disabled={loading}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px',
            backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px',
            color: '#4b5563', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s ease',
            boxShadow: '0 2px 5px rgba(0,0,0,0.02)'
          }}
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} color="#7c3aed" />
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div className="glass-card" style={{ padding: '24px', borderRadius: '16px', borderLeft: '4px solid #FFA620', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', background: 'rgba(255,166,32,0.1)', borderRadius: '12px', color: '#FFA620' }}>
            <MessageSquare size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: 0, fontWeight: 600 }}>Total Reviews</p>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0, color: '#1f2937' }}>{data.totalReviews}</h3>
          </div>
        </div>
        <div className="glass-card" style={{ padding: '24px', borderRadius: '16px', borderLeft: '4px solid #7c3aed', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', background: 'rgba(124,58,237,0.1)', borderRadius: '12px', color: '#7c3aed' }}>
            <ThumbsUp size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: 0, fontWeight: 600 }}>Average Rating</p>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0, color: '#1f2937' }}>
              {data.avgRating} <span style={{ fontSize: '1rem', color: '#FFA620' }}>★</span>
            </h3>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {loading && data.reviews.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>Loading reviews…</div>
      ) : data.reviews.length === 0 ? (
        <div className="glass-card" style={{ padding: '60px', borderRadius: '16px', textAlign: 'center', color: '#6b7280' }}>
          <MessageSquare size={48} color="#d1d5db" style={{ marginBottom: '16px' }} />
          <h3 style={{ margin: '0 0 8px', color: '#9ca3af' }}>No reviews yet</h3>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>Customer reviews submitted on the website will appear here.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
          {data.reviews.map((review) => (
            <div
              key={review._id}
              className="glass-card"
              style={{ padding: '24px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '12px', transition: 'box-shadow 0.2s' }}
            >
              {/* Stars */}
              <div style={{ display: 'flex', gap: '3px' }}>
                {renderStars(review.rating)}
              </div>

              {/* Message */}
              <p style={{ margin: 0, fontSize: '0.92rem', color: '#374151', lineHeight: 1.6, flexGrow: 1 }}>
                "{review.message}"
              </p>

              {/* Author & Date */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f3f4f6', paddingTop: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #FF4B8B, #7c3aed)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 800, fontSize: '0.9rem', flexShrink: 0
                  }}>
                    {review.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '0.88rem', color: '#1f2937' }}>{review.name}</p>
                    {review.email && (
                      <p style={{ margin: 0, fontSize: '0.73rem', color: '#9ca3af' }}>{review.email}</p>
                    )}
                  </div>
                </div>
                <span style={{ fontSize: '0.72rem', color: '#9ca3af', flexShrink: 0 }}>{formatDate(review.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
