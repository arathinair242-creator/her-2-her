import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Video, Search, ChevronRight, X } from 'lucide-react';
import { expertApi, consultApi } from '../api/apiClient';
import VideoCallModal from './VideoCallModal';
import BookingCheckoutModal from './BookingCheckoutModal';
import './Pages.css';

export default function ConsultPage({ setChatOpen }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('All');
  const [bookingExpert, setBookingExpert] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [showSuccessBooking, setShowSuccessBooking] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutDetails, setCheckoutDetails] = useState(null);
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [activeCallExpert, setActiveCallExpert] = useState(null);
  const [activeCallRoomId, setActiveCallRoomId] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [recommendationBanner, setRecommendationBanner] = useState('');

  useEffect(() => {
    const recommended = sessionStorage.getItem('her2her_recommended_specialist');
    if (recommended) {
      setSpecialtyFilter(recommended);
      setRecommendationBanner(`Based on your wellness assessment, we strongly recommend consulting a ${recommended} which have been filtered for you below.`);
      sessionStorage.removeItem('her2her_recommended_specialist'); // clear after reading
    }
  }, []);

  useEffect(() => {
    const fetchExperts = async () => {
      try {
        const data = await expertApi.getExperts();
        setExperts(data);
      } catch (err) {
        console.error("Error fetching experts:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchExperts();
  }, []);

  const handleBooking = async (e) => {
    e.preventDefault();
    if (bookingLoading) return;
    
    if (localStorage.getItem('her2her_is_logged_in') !== 'true') {
      alert("Please log in first to book an appointment.");
      return;
    }

    if (!bookingDate || !bookingTime) {
      alert("Please select both a date and a time slot.");
      return;
    }

    setBookingLoading(true);
    try {
      // Step 1: Create consultation as Pending
      console.log('[PAYMENT FLOW] Step 1: Creating consultation booking...');
      const consultation = await consultApi.bookSession({
        expertId: bookingExpert._id || bookingExpert.id,
        date: bookingDate,
        time: bookingTime,
        type: 'Video',
      });
      console.log('[PAYMENT FLOW] Step 1 SUCCESS: Consultation created:', consultation);

      const consultationId = consultation._id || consultation.id;
      if (!consultationId) {
        throw new Error('Server did not return a valid consultation ID.');
      }

      // Step 2: Open payment checkout with consultation details
      const sessionFee = Number(bookingExpert.charges?.video) || Number(bookingExpert.consultationFee) || 500;
      setCheckoutDetails({
        expertName: bookingExpert.name,
        expertId: bookingExpert._id || bookingExpert.id,
        consultationId: consultationId,
        date: bookingDate,
        time: bookingTime,
        amount: sessionFee,
        userName: localStorage.getItem('her2her_user_name') || '',
        userEmail: localStorage.getItem('her2her_user_email') || '',
      });
      console.log('[PAYMENT FLOW] Step 2: Opening checkout modal...');
      // FIX: Was calling setShowBookingModal(false) which doesn't exist.
      // The booking modal is controlled by bookingExpert state.
      setBookingExpert(null);
      setShowCheckout(true);
    } catch (err) {
      console.error('[PAYMENT FLOW] ERROR in booking step:', err);
      alert('Could not create appointment: ' + err.message);
    } finally {
      setBookingLoading(false);
    }
  };

  const handleFinalizeBooking = (paymentData) => {
    // Payment was successful — consultation is now Confirmed on backend.
    // Close the checkout modal (the success state is already presented inside it).
    setShowCheckout(false);
  };

  const startVideoCall = (expert) => {
    console.log('--- STARTING VIDEO CALL ---', expert.name);
    setActiveCallExpert(expert);
    // Use a deterministic room ID for instant calls if no appointment exists
    setActiveCallRoomId(`instant-room-${expert._id || expert.id}`);
    setShowVideoCall(true);
  };

  const closeBooking = () => {
    setBookingExpert(null);
    setBookingDate('');
    setBookingTime('');
    setShowSuccessBooking(false);
  };

  const filteredExperts = experts.filter(exp => {
    const name = exp.name || '';
    const specialization = exp.specialization || '';
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          specialization.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = specialtyFilter === 'All' || specialization === specialtyFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="page-container">
      {/* Banner */}
      <div className="page-banner-card" style={{ background: 'linear-gradient(135deg, rgba(5, 205, 153, 0.1) 0%, rgba(124, 92, 255, 0.1) 100%)' }}>
        <div className="page-banner-content">
          <h1 className="page-banner-title">Meet Your Experts</h1>
          <p className="page-banner-desc">
            Connect directly with verified gynecologists, nutritionists & fitness trainers specializing in women's health.
          </p>
        </div>
        <div className="page-banner-visual">
          <svg className="wellness-illustration-svg" viewBox="0 0 200 200" fill="none">
            <defs>
              <linearGradient id="tealPurpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#05CD99" />
                <stop offset="100%" stopColor="#7C5CFF" />
              </linearGradient>
            </defs>
            <circle cx="100" cy="100" r="75" fill="url(#tealPurpleGrad)" opacity="0.1" />
            <path d="M100 45a25 25 0 00-25 25c0 20 25 45 25 45s25-25 25-25a25 25 0 00-25-25z" fill="url(#tealPurpleGrad)" />
            <circle cx="100" cy="70" r="8" fill="white" />
          </svg>
        </div>
      </div>

      {/* Search & Filter controls */}
      {recommendationBanner && (
        <div style={{
          background: 'var(--primary-pink-light)', border: '1px solid var(--primary-pink)', borderRadius: '16px',
          padding: '16px 24px', marginBottom: '20px', color: 'var(--text-dark)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div>
            <span style={{ fontSize: '1.2rem', marginRight: '10px' }}>🌸</span>
            {recommendationBanner}
          </div>
          <button onClick={() => setRecommendationBanner('')} style={{ background:'transparent', border:'none', cursor:'pointer', color:'var(--text-light)' }}><X size={16} /></button>
        </div>
      )}
      
      <div className="consult-search-bar">
        <input 
          type="text" 
          placeholder="Search experts by name or role..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="consult-search-input"
        />
        <select 
          className="consult-filter-select"
          value={specialtyFilter}
          onChange={(e) => setSpecialtyFilter(e.target.value)}
        >
          <option value="All">All Specialties</option>
          <option value="Gynecologist">Gynecologist</option>
          <option value="Nutritionist">Nutritionist</option>
          <option value="Fitness Trainer">Fitness Trainer</option>
        </select>
      </div>

      {/* Experts Grid */}
      <div className="experts-grid">
        {loading ? (
          <p style={{ textAlign: 'center', gridColumn: 'span 3', padding: '40px 0' }}>Loading experts...</p>
        ) : filteredExperts.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-light)', gridColumn: 'span 3', padding: '40px 0' }}>
            No experts found matching your search.
          </p>
        ) : (
          filteredExperts.map((exp) => (
            <div key={exp._id || exp.id} className="expert-card glass-card">
              <div className="expert-image-container">
                <div className="expert-avatar-placeholder" style={{
                  backgroundImage: 'linear-gradient(135deg, var(--secondary-violet-light) 0%, var(--primary-pink-light) 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary-violet)', fontSize: '2.5rem', fontWeight: 'bold'
                }}>
                  {exp.name.split(' ').map(n=>n[0]).join('')}
                </div>
                <span className="availability-dot" />
              </div>
              <div className="expert-details">
                <h4 className="expert-name">{exp.name}</h4>
                <p className="expert-role">{exp.specialization}</p>
                <p className="expert-exp">{exp.experience || 'Verified Expert'}</p>
                
                <div className="expert-rating">
                  <Star size={16} className="star-icon" fill="currentColor" />
                  <span className="rating-score">4.9</span>
                  <span className="rating-count">(Recently Joined)</span>
                </div>

                <div className="expert-actions">
                  <button className="btn-chat" onClick={() => { setChatOpen(true); alert(`Opening direct chat with ${exp.name}...`); }}>
                    <MessageSquare size={16} /> Chat
                  </button>
                  <button className="btn-video" onClick={() => startVideoCall(exp)}>
                    <Video size={16} /> Video
                  </button>
                </div>
                <button className="btn-primary expert-book-btn" onClick={() => setBookingExpert(exp)}>
                  Book Appointment
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Booking Modal */}
      {bookingExpert && (
        <div className="modal-overlay">
          <div className="modal-card glass-card">
            <button className="modal-close-btn" onClick={closeBooking}>
              <X size={20} />
            </button>
            
            {!showSuccessBooking ? (
              <>
                <h3 className="modal-title">Book Session with {bookingExpert.name}</h3>
                <p style={{ color: 'var(--text-gray)', fontSize: '0.9rem', marginBottom: '20px' }}>
                  Choose a date and time slot for your 30-minute virtual consultation (Fee: ₹{Number(bookingExpert.charges?.video) || Number(bookingExpert.consultationFee) || 500}).
                </p>

                <form onSubmit={handleBooking}>
                  <div className="modal-form-group">
                    <label>Select Date</label>
                    <input 
                      type="date" 
                      className="modal-form-input" 
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      required 
                    />
                  </div>

                  <div className="modal-form-group">
                    <label>Select Time Slot</label>
                    <select 
                      className="modal-form-input"
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                      required
                    >
                      <option value="">Choose a slot...</option>
                      <option value="10:00 AM">10:00 AM - 10:30 AM</option>
                      <option value="11:30 AM">11:30 AM - 12:00 PM</option>
                      <option value="2:00 PM">02:00 PM - 02:30 PM</option>
                      <option value="4:30 PM">04:30 PM - 05:00 PM</option>
                    </select>
                  </div>

                  <div className="modal-actions">
                    <button type="button" className="btn-modal-cancel" onClick={closeBooking} disabled={bookingLoading}>Cancel</button>
                    <button type="submit" className="btn-modal-submit" disabled={bookingLoading}>
                      {bookingLoading ? 'Processing...' : `Proceed to Payment (₹${Number(bookingExpert.charges?.video) || Number(bookingExpert.consultationFee) || 500})`}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--teal-light)', color: 'var(--teal-accent)', marginBottom: '16px' }}>
                  ✓
                </div>
                <h3 style={{ color: 'var(--text-dark)', marginBottom: '8px' }}>Booking Confirmed!</h3>
                <p style={{ color: 'var(--text-gray)', fontSize: '0.95rem', marginBottom: '24px' }}>
                  Your consultation with <strong>{bookingExpert.name}</strong> is scheduled for <strong>{bookingDate}</strong> at <strong>{bookingTime}</strong>. Calendar invite and video links have been sent.
                </p>
                <button className="btn-modal-submit" onClick={closeBooking}>Awesome</button>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Payment Checkout Modal */}
      <BookingCheckoutModal 
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        bookingDetails={checkoutDetails}
        onPaymentSuccess={handleFinalizeBooking}
      />

      {/* Video Call Simulation Overlay */}
      {showVideoCall && (
        <VideoCallModal 
          expert={activeCallExpert} 
          onClose={() => setShowVideoCall(false)} 
          appointmentId={activeCallRoomId}
        />
      )}
    </div>
  );
}
