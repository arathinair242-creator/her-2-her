import React, { useState, useEffect } from 'react';
import { 
  Users, Heart, MessageSquare, Search, Sparkles, 
  Video, Smile, ShieldAlert, Calendar, X, Plus,
  Brain, Scale, Lock
} from 'lucide-react';
import { communityApi } from '../api/apiClient';

export default function CommunityPage() {
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  
  // Category chip filter state
  const [selectedCategory, setSelectedCategory] = useState('All');

  // New Discussion Modal state
  const [showDiscussionModal, setShowDiscussionModal] = useState(false);
  const [newTopic, setNewTopic] = useState('');
  const [newCategory, setNewCategory] = useState('PCOS');

  // Groups list with dynamic join state
  const [groups, setGroups] = useState([
    { id: 1, name: "PCOS Warriors", label: "PCOS", joined: false },
    { id: 2, name: "Weight Loss Journey", label: "Weight Loss", joined: false },
    { id: 3, name: "Mental Wellness Support", label: "Mental Wellness", joined: false }
  ]);

  // Discussions list
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Session reminder state
  const [sessionReminded, setSessionReminded] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const data = await communityApi.getPosts();
      setDiscussions(data);
    } catch (err) {
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
    }
  };

  // Toggle group join
  const toggleJoinGroup = (groupId) => {
    setGroups(prevGroups => prevGroups.map(g => {
      if (g.id === groupId) {
        return { ...g, joined: !g.joined };
      }
      return g;
    }));
  };

  // Toggle discussion like
  const toggleLikeDiscussion = async (discId) => {
    try {
      const updatedPost = await communityApi.likePost(discId);
      setDiscussions(prevDiscs => prevDiscs.map(d => d._id === discId ? updatedPost : d));
    } catch (err) {
      console.error("Error liking post:", err);
      alert("Please login to like posts");
    }
  };

  // Handle posting a new discussion
  const handlePostDiscussion = async (e) => {
    e.preventDefault();
    if (!newTopic.trim()) return;

    try {
      const authorName = localStorage.getItem('her2her_username') || 'You';
      const newPost = await communityApi.createPost({
        title: newTopic,
        content: newTopic, // content is post title for now
        category: newCategory,
        authorName
      });

      setDiscussions([newPost, ...discussions]);
      setNewTopic('');
      setShowDiscussionModal(false);
    } catch (err) {
      console.error("Error creating post:", err);
      alert("Please login to post a discussion");
    }
  };

  // Filtered discussions list based on search and category chip
  const filteredDiscussions = discussions.filter(disc => {
    const title = disc.title || '';
    const author = disc.authorName || '';
    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          author.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || disc.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="page-container">
      {/* Banner */}
      <div className="page-banner-card">
        <div className="page-banner-content">
          <h1 className="page-banner-title">You're Not Alone, We're Together</h1>
          <p className="page-banner-desc">
            Join our supportive community of thousands of women sharing advice, stories, and motivation.
          </p>
        </div>
        <div className="page-banner-visual">
          {/* Custom SVG Group of Women illustration */}
          <svg className="community-illustration-svg" viewBox="0 0 200 200" fill="none">
            <defs>
              <linearGradient id="commGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF4B8B" />
                <stop offset="100%" stopColor="#7C5CFF" />
              </linearGradient>
            </defs>
            <circle cx="100" cy="100" r="75" fill="url(#commGrad)" opacity="0.1" />
            {/* Center woman */}
            <circle cx="100" cy="80" r="22" fill="#7C5CFF" opacity="0.8" />
            <path d="M70 140c0-20 15-30 30-30s30 10 30 30H70z" fill="#7C5CFF" opacity="0.8" />
            {/* Left woman */}
            <circle cx="68" cy="90" r="18" fill="#FF4B8B" opacity="0.75" />
            <path d="M42 140c0-15 12-25 26-25s26 10 26 25H42z" fill="#FF4B8B" opacity="0.75" />
            {/* Right woman */}
            <circle cx="132" cy="90" r="18" fill="#05CD99" opacity="0.75" />
            <path d="M106 140c0-15 12-25 26-25s26 10 26 25h-52z" fill="#05CD99" opacity="0.75" />
          </svg>
        </div>
      </div>

      {/* Search Row */}
      <div className="community-search-row">
        <div className="search-input-wrapper">
          <Search size={20} className="search-input-icon" />
          <input 
            type="text" 
            placeholder="Search topics, groups, posts..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="community-search-input"
          />
        </div>
      </div>

      {/* Filter Chips */}
      <div className="filter-tags-row">
        {['All', 'Popular', 'PCOS', 'Weight Loss', 'Mental Wellness'].map((tag) => (
          <button 
            key={tag} 
            className={`filter-tag-chip ${selectedCategory === tag ? 'active' : ''}`}
            onClick={() => setSelectedCategory(tag)}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Popular Groups Section */}
      <div className="page-section-header">
        <h3 className="page-section-title">Popular Groups</h3>
        <span className="page-view-all">View All</span>
      </div>

      <div className="groups-grid">
        {groups.map((grp) => (
          <div key={grp.id} className="glass-card group-card">
            <div className={`group-avatar ${grp.id === 1 ? 'pcos' : grp.id === 2 ? 'weight' : 'mental'}`}>
              {grp.id === 1 && <Heart size={24} fill="currentColor" />}
              {grp.id === 2 && <Scale size={24} />}
              {grp.id === 3 && <Brain size={24} />}
            </div>
            <div>
              <h4 className="group-name">{grp.name}</h4>
              <p className="group-members">{grp.label}</p>
            </div>
            <button 
              className={`btn-group-action ${grp.joined ? 'joined' : ''}`}
              onClick={() => toggleJoinGroup(grp.id)}
            >
              {grp.joined ? 'Joined' : 'Join'}
            </button>
          </div>
        ))}
      </div>

      <div className="page-grid-2-1">
        {/* Left Column: Trending discussions & start button */}
        <div>
          <div className="page-section-header" style={{ marginTop: 0 }}>
            <h3 className="page-section-title">Trending Discussions</h3>
            <span className="page-view-all">View All</span>
          </div>

          <div className="glass-card discussions-card">
            {loading ? (
              <p style={{ textAlign: 'center', padding: '20px 0' }}>Loading discussions...</p>
            ) : filteredDiscussions.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-light)', padding: '20px 0' }}>
                No discussions found matching your criteria.
              </p>
            ) : (
              filteredDiscussions.map((disc) => (
                <div key={disc._id || disc.id} className="discussion-post-item">
                  <div className="post-author-row">
                    <div className="post-author-avatar" style={{
                      backgroundImage: 'linear-gradient(135deg, var(--secondary-violet-light) 0%, var(--primary-pink-light) 100%)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary-violet)', fontWeight: 'bold', fontSize: '0.8rem'
                    }}>
                      {(disc.authorName || 'An').substring(0, 2)}
                    </div>
                    <div className="author-details-grp">
                      <span className="post-author-name">{disc.authorName}</span>
                      <span className="post-time-stamp">{new Date(disc.createdAt).toLocaleDateString()} • <span style={{ color: 'var(--primary-pink)' }}>{disc.category}</span></span>
                    </div>
                  </div>

                  <h4 className="post-content-title">{disc.title}</h4>

                  <div className="post-actions-row">
                    <button 
                      className={`post-action-btn ${disc.likes?.includes(localStorage.getItem('her2her_user_id')) ? 'liked' : ''}`} 
                      onClick={() => toggleLikeDiscussion(disc._id || disc.id)}
                    >
                      <Heart size={16} fill={disc.likes?.includes(localStorage.getItem('her2her_user_id')) ? 'currentColor' : 'none'} />
                      <span>{disc.likes?.length || 0}</span>
                    </button>
                    <div className="post-action-btn">
                      <MessageSquare size={16} />
                      <span>{disc.comments?.length || 0}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Floating discussion launch button */}
          <div className="floating-action-container">
            <button className="btn-start-discussion" onClick={() => setShowDiscussionModal(true)}>
              <Plus size={18} /> Start a Discussion
            </button>
          </div>
        </div>

        {/* Right Column: Highlights & Motivation */}
        <div>
          <h3 className="page-section-title" style={{ margin: '0 0 16px 0' }}>Community Highlights</h3>

          <div className="highlights-grid" style={{ gridTemplateColumns: '1fr', gap: '20px' }}>
            {/* Success Story */}
            <div className="glass-card highlight-card">
              <div>
                <span className="highlight-tag">Success Story</span>
                <p className="highlight-content-text">
                  "Her-2-Her helped me manage my PCOS symptoms, lose 8kg, and improve my overall metabolic health."
                </p>
              </div>
              <div className="success-story-author">
                <div className="success-author-avatar" style={{
                  backgroundImage: 'linear-gradient(135deg, var(--primary-pink) 0%, var(--orange-accent) 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold'
                }}>
                  RS
                </div>
                <div>
                  <h5 style={{ fontWeight: 700, color: 'var(--text-dark)' }}>Riya S.</h5>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Member for 6 months</p>
                </div>
              </div>
            </div>

            {/* Expert Live Session */}
            <div className="glass-card highlight-card">
              <div>
                <span className="highlight-tag" style={{ color: 'var(--secondary-violet)' }}>Expert Live Session</span>
                <h4 style={{ fontWeight: 700, color: 'var(--text-dark)', marginBottom: '4px' }}>PCOS & Fertility: Myths vs Facts</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-gray)', marginBottom: '12px' }}>With Dr. Anjali Sharma</p>
                
                <div className="expert-session-info">
                  <span className="expert-session-time">
                    <Calendar size={14} /> Tomorrow, 5:00 PM
                  </span>
                </div>
              </div>
              <button 
                className={`btn-remind-me ${sessionReminded ? 'active' : ''}`}
                onClick={() => setSessionReminded(!sessionReminded)}
              >
                {sessionReminded ? '✓ Reminded' : 'Remind Me'}
              </button>
            </div>
          </div>

          {/* Daily Motivation */}
          <div className="glass-card motivation-card" style={{ marginTop: '24px' }}>
            <div className="motivation-left">
              <span className="motivation-lbl">Daily Motivation</span>
              <p className="motivation-quote">
                "Take care of your body. It's the only place you have to live."
              </p>
            </div>
            <div className="motivation-icon">
              🌸
            </div>
          </div>

          {/* Guidelines */}
          <h3 className="page-section-title" style={{ margin: '24px 0 16px 0' }}>Community Guidelines</h3>
          <div className="glass-card" style={{ padding: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px' }}>
                <Smile size={16} style={{ color: 'var(--primary-pink)' }} />
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dark)' }}>Be Kind & Respectful</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px' }}>
                <ShieldAlert size={16} style={{ color: 'var(--primary-pink)' }} />
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dark)' }}>No Hate Speech</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px' }}>
                <MessageSquare size={16} style={{ color: 'var(--primary-pink)' }} />
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dark)' }}>No Spam or Self-Promo</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px' }}>
                <Lock size={16} style={{ color: 'var(--primary-pink)' }} />
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dark)' }}>Protect Privacy</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Start Discussion Modal */}
      {showDiscussionModal && (
        <div className="modal-overlay">
          <div className="modal-card glass-card">
            <button className="modal-close-btn" onClick={() => setShowDiscussionModal(false)}>
              <X size={20} />
            </button>
            <h3 className="modal-title">Start a Discussion</h3>
            <form onSubmit={handlePostDiscussion}>
              <div className="modal-form-group">
                <label>Discussion Topic</label>
                <textarea 
                  className="modal-form-textarea" 
                  placeholder="What is on your mind? (e.g. Tips for cycle cramps, high protein foods...)"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  required 
                />
              </div>

              <div className="modal-form-group">
                <label>Category Tag</label>
                <select 
                  className="modal-form-input" 
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                >
                  <option value="PCOS">PCOS</option>
                  <option value="Weight Loss">Weight Loss</option>
                  <option value="Mental Wellness">Mental Wellness</option>
                  <option value="General Health">General Health</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-modal-cancel" onClick={() => setShowDiscussionModal(false)}>Cancel</button>
                <button type="submit" className="btn-modal-submit">Post Topic</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
