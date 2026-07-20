import React from 'react';
import { 
  Heart, ShieldCheck, Users, Sparkles, Smile, 
  ArrowRight, Compass, Info, Award, Mail
} from 'lucide-react';
import communityImg from '../assets/logo.png';

export default function AboutUsPage() {
  const pillars = [
    {
      title: "Empower Women",
      desc: "We empower women with the knowledge, tools, and support they need to live healthier, happier lives.",
      color: "var(--primary-pink)",
      bgColor: "var(--primary-pink-light)",
      icon: <Heart size={22} />
    },
    {
      title: "Expert Care",
      desc: "Access to verified experts and personalized guidance across every stage of a woman's life.",
      color: "var(--secondary-violet)",
      bgColor: "var(--secondary-violet-light)",
      icon: <Users size={22} />
    },
    {
      title: "Holistic Wellness",
      desc: "From physical to mental well-being, we address complete wellness in one integrated platform.",
      color: "var(--teal-accent)",
      bgColor: "var(--teal-light)",
      icon: <Sparkles size={22} />
    },
    {
      title: "Community First",
      desc: "A safe, supportive, and judgment-free community where women can connect, share, and grow together.",
      color: "var(--blue-accent)",
      bgColor: "var(--blue-light)",
      icon: <Smile size={22} />
    }
  ];

  const timeline = [
    {
      year: "Feb 2025",
      title: "The Beginning",
      desc: "Her-2-Her was born — our journey started with a bold vision to create a safe space for women's health."
    },
    {
      year: "Mar 2025",
      title: "Platform Launch",
      desc: "Her-2-Her went live with expert consultations, AI support, and our first community members."
    },
    {
      year: "May 2025",
      title: "Growing Fast",
      desc: "Onboarded verified experts, partner organizations, and a growing community of women."
    },
    {
      year: "Jul 2025",
      title: "Expanding Impact",
      desc: "More features, more experts, and more lives touched — with many milestones ahead."
    }
  ];

  const values = [
    {
      title: "Trust & Confidentiality",
      desc: "We prioritize your privacy and data security above all.",
      icon: <ShieldCheck size={20} />
    },
    {
      title: "Compassion",
      desc: "We care deeply and are here to support you, always.",
      icon: <Heart size={20} />
    },
    {
      title: "Inclusivity",
      desc: "We celebrate every woman and are inclusive to all.",
      icon: <Users size={20} />
    },
    {
      title: "Innovation",
      desc: "We use technology and data to deliver better healthcare.",
      icon: <Sparkles size={20} />
    },
    {
      title: "Integrity",
      desc: "We are honest, transparent, and committed to you.",
      icon: <Award size={20} />
    }
  ];

  const teamMembers = [
    {
      name: "Shreya Mhatre",
      role: "Co-Founder & Full Stack Developer",
      tagline: "Building the tech backbone that empowers every woman.",
      initials: "SM",
      color: "var(--primary-pink)",
      gradient: "linear-gradient(135deg, #ff4b8b, #ff8fab)"
    },
    {
      name: "Arathi Nair",
      role: "Co-Founder & Product Lead",
      tagline: "Designing solutions born from lived experience and empathy.",
      initials: "AN",
      color: "var(--secondary-violet)",
      gradient: "linear-gradient(135deg, #7c5cff, #a78bfa)"
    },
    {
      name: "Shruti Naik",
      role: "Co-Founder & Backend Developer",
      tagline: "Turning data and APIs into meaningful health insights.",
      initials: "SN",
      color: "var(--teal-accent)",
      gradient: "linear-gradient(135deg, #0d9488, #2dd4bf)"
    },
    {
      name: "Neha Zanje",
      role: "Co-Founder & UI/UX Designer",
      tagline: "Crafting every pixel with purpose and compassion.",
      initials: "NZ",
      color: "var(--blue-accent)",
      gradient: "linear-gradient(135deg, #3b82f6, #93c5fd)"
    }
  ];

  return (
    <div className="page-container" style={{ maxWidth: '1200px' }}>
      
      {/* 1. Header Layout */}
      <div className="about-header-layout" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '30px', marginBottom: '50px', alignItems: 'center' }}>
        {/* Left Column: Text Intro */}
        <div>
          <span className="about-label" style={{ textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '0.05em', color: 'var(--text-light)', fontWeight: 700 }}>About Us</span>
          <h1 className="about-title" style={{ fontFamily: 'var(--font-serif)', fontSize: '3rem', color: 'var(--text-dark)', margin: '8px 0 16px 0', lineHeight: 1.1, fontVariantNumeric: 'lining-nums' }}>
            About <br /><span className="gradient-text" style={{ fontVariantNumeric: 'lining-nums', verticalAlign: 'baseline' }}>Her-2-Her</span> <span style={{ fontSize: '1.8rem', verticalAlign: 'middle' }}>❤️</span>
          </h1>
          <p style={{ fontWeight: 600, color: 'var(--primary-pink)', marginBottom: '16px', fontSize: '1.05rem' }}>Empowering Every Woman. Every Day.</p>
          <p style={{ color: 'var(--text-gray)', lineHeight: 1.6, fontSize: '0.95rem', marginBottom: '24px' }}>
            Her-2-Her is a digital wellness platform dedicated to women's complete health and well-being. We bring together expert care, personalized plans, and a supportive community – all in one place.
          </p>
          <button className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 28px', borderRadius: '99px', fontWeight: 600 }}>
            Our Journey <ArrowRight size={16} />
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '320px', height: '220px', borderRadius: '24px', overflow: 'hidden', border: 'none', background: 'transparent', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={communityImg} alt="Her-2-Her Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
        </div>

        {/* Right Column: Stats Highlights */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
          <div className="glass-card" style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--primary-pink-light)', color: 'var(--primary-pink)', display: 'flex', alignItems: 'center', justifyCenter: 'center', flexShrink: 0, justifyContent: 'center' }}>
              <Users size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-dark)' }}>10,000+</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-gray)' }}>Women Empowered</p>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--secondary-violet-light)', color: 'var(--secondary-violet)', display: 'flex', alignItems: 'center', justifyCenter: 'center', flexShrink: 0, justifyContent: 'center' }}>
              <Users size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-dark)' }}>500+</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-gray)' }}>Expert Consultants</p>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--teal-light)', color: 'var(--teal-accent)', display: 'flex', alignItems: 'center', justifyCenter: 'center', flexShrink: 0, justifyContent: 'center' }}>
              <Smile size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-dark)' }}>95%</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-gray)' }}>User Satisfaction</p>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--blue-light)', color: 'var(--blue-accent)', display: 'flex', alignItems: 'center', justifyCenter: 'center', flexShrink: 0, justifyContent: 'center' }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-dark)' }}>24/7</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-gray)' }}>AI Support</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Founding Story Banner */}
      <div style={{ marginBottom: '50px', borderRadius: '24px', overflow: 'hidden', background: 'linear-gradient(135deg, rgba(255,75,139,0.06) 0%, rgba(124,92,255,0.06) 100%)', border: '1px solid rgba(255,75,139,0.15)', padding: '48px 52px', display: 'grid', gridTemplateColumns: '1fr auto', gap: '40px', alignItems: 'center' }}>
        <div>
          <span style={{ textTransform: 'uppercase', fontSize: '0.78rem', letterSpacing: '0.1em', fontWeight: 700, color: 'var(--primary-pink)', display: 'block', marginBottom: '12px' }}>Our Founding Story</span>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--text-dark)', marginBottom: '18px', lineHeight: 1.25 }}>Why We Built Her-2-Her</h2>
          <p style={{ color: 'var(--text-gray)', lineHeight: 1.85, fontSize: '1rem', maxWidth: '680px', margin: '0 0 14px 0' }}>
            Her-2-Her was founded by four college friends who shared more than just friendship. Shreya Mhatre, Arathi Nair, Shruti Naik and Neha Zanje each personally navigated the challenges of PCOD, PCOS and irregular periods. They faced confusing symptoms, dismissive medical encounters and a critical lack of trustworthy, accessible information.
          </p>
          <p style={{ color: 'var(--text-gray)', lineHeight: 1.85, fontSize: '1rem', maxWidth: '680px', margin: 0 }}>
            Driven by that shared experience, they chose to act. Her-2-Her is the result — a platform built by women, for women, grounded in empathy and powered by technology.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', flexShrink: 0 }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #ff4b8b, #7c5cff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', boxShadow: '0 8px 24px rgba(255,75,139,0.3)' }}>💜</div>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'center' }}>Est. 2025</span>
        </div>
      </div>

      {/* 3. Our Mission */}
      <div className="glass-card" style={{ padding: '40px', textAlign: 'center', marginBottom: '50px', background: 'linear-gradient(135deg, rgba(255, 75, 139, 0.05) 0%, rgba(124, 92, 255, 0.05) 100%)' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--text-dark)', marginBottom: '12px' }}>Our Mission</h2>
        <p style={{ maxWidth: '800px', margin: '0 auto', fontSize: '1.25rem', lineHeight: 1.6, color: 'var(--text-gray)', fontStyle: 'italic' }}>
          "To make women's healthcare more accessible, personalized, and empowering through technology, compassion, and community."
        </p>
      </div>

      {/* 4. Core Pillars */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '50px' }}>
        {pillars.map((p, idx) => (
          <div key={idx} className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: p.bgColor, color: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {p.icon}
            </div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-dark)' }}>{p.title}</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-gray)', lineHeight: 1.5 }}>{p.desc}</p>
          </div>
        ))}
      </div>

      {/* 4. Our Journey Timeline */}
      <div className="page-grid-1-2" style={{ marginBottom: '50px', alignItems: 'center' }}>
        <div className="glass-card" style={{ padding: '30px', background: 'linear-gradient(135deg, rgba(255, 75, 139, 0.05) 0%, rgba(124, 92, 255, 0.05) 100%)' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--text-dark)', marginBottom: '14px' }}>Our Journey</h2>
          <p style={{ color: 'var(--text-gray)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '20px' }}>
            Her-2-Her was born from a simple belief – every woman deserves the best care, support, and information to thrive. What started as a small idea is now a growing movement of thousands of women and experts who trust and support each other every day.
          </p>
          <button className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 24px', borderRadius: '99px', fontWeight: 600 }}>
            Read Our Story <ArrowRight size={14} />
          </button>
        </div>

        <div className="glass-card" style={{ padding: '30px', position: 'relative' }}>
          {/* Vertical line connection */}
          <div style={{ position: 'absolute', top: '40px', bottom: '40px', left: '40px', width: '2px', backgroundColor: 'var(--border-color)', zIndex: 1 }} />
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', zIndex: 2, position: 'relative' }}>
            {timeline.map((t, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '24px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'white', border: '4px solid var(--secondary-violet)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 3 }} />
                <div>
                  <span style={{ fontWeight: 800, color: 'var(--secondary-violet)', fontSize: '1.1rem' }}>{t.year}</span>
                  <h4 style={{ fontWeight: 700, color: 'var(--text-dark)', fontSize: '0.95rem', marginTop: '2px' }}>{t.title}</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-gray)', marginTop: '4px' }}>{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Our Values */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--text-dark)' }}>Our Values</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '30px' }}>
        {values.map((v, idx) => (
          <div key={idx} className="glass-card" style={{ padding: '20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--primary-pink-light)', color: 'var(--primary-pink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {v.icon}
            </div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-dark)' }}>{v.title}</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-gray)', lineHeight: 1.4 }}>{v.desc}</p>
          </div>
        ))}
      </div>



      {/* 7. Meet the Team */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <span style={{ textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '0.05em', color: 'var(--text-light)', fontWeight: 700 }}>The People Behind It</span>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--text-dark)', margin: '8px 0 10px' }}>Meet the Founders</h2>
        <p style={{ color: 'var(--text-gray)', maxWidth: '520px', margin: '0 auto', fontSize: '0.95rem' }}>Four women. One mission. A platform built from the heart. 💕</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '60px' }}>
        {teamMembers.map((member, idx) => (
          <div
            key={idx}
            className="glass-card"
            style={{ padding: '28px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', transition: 'transform 0.25s, box-shadow 0.25s', cursor: 'default' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.10)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = ''; }}
          >
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: member.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: 800, color: 'white', letterSpacing: '1px', boxShadow: `0 6px 20px rgba(0,0,0,0.15)` }}>
              {member.initials}
            </div>
            <div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-dark)', margin: '0 0 4px' }}>{member.name}</h4>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: member.color, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{member.role}</span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-gray)', lineHeight: 1.55, margin: 0, fontStyle: 'italic' }}>"{member.tagline}"</p>
            <div style={{ width: '40px', height: '3px', borderRadius: '99px', background: member.gradient, marginTop: '4px' }} />
          </div>
        ))}
      </div>

      {/* 8. Contact Us */}
      <div style={{ marginTop: '60px', marginBottom: '20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <span style={{ textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '0.05em', color: 'var(--text-light)', fontWeight: 700 }}>Get In Touch</span>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--text-dark)', margin: '8px 0 10px' }}>Contact Us</h2>
          <p style={{ color: 'var(--text-gray)', maxWidth: '500px', margin: '0 auto', fontSize: '0.95rem' }}>We're here for you — reach out anytime through any of the channels below.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>

          {/* Instagram */}
          <a
            href="https://www.instagram.com/hertoher_heart?igsh=ZTNrZ3RqOWF6NDlr"
            target="_blank"
            rel="noreferrer"
            style={{ textDecoration: 'none' }}
          >
            <div className="glass-card" style={{ padding: '28px 20px', textAlign: 'center', borderRadius: '20px', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'none'}
            >
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: 800, color: '#1f2937', fontSize: '0.95rem' }}>Instagram</p>
                <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: '#bc1888', fontWeight: 600 }}>@hertoher_heart</p>
              </div>
            </div>
          </a>



          {/* YouTube */}
          <a href="https://www.youtube.com/@Her-2-Her" target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
            <div className="glass-card" style={{ padding: '28px 20px', textAlign: 'center', borderRadius: '20px', cursor: 'pointer', transition: 'transform 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'none'}
            >
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, #ff0000, #cc0000)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: 800, color: '#1f2937', fontSize: '0.95rem' }}>YouTube</p>
                <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: '#cc0000', fontWeight: 600 }}>@Her-2-Her</p>
              </div>
            </div>
          </a>

          {/* Email */}
          <a href="mailto:her-2-herofficial@gmil.com" style={{ textDecoration: 'none' }}>
            <div className="glass-card" style={{ padding: '28px 20px', textAlign: 'center', borderRadius: '20px', cursor: 'pointer', transition: 'transform 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'none'}
            >
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Mail size={26} color="white" />
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: 800, color: '#1f2937', fontSize: '0.95rem' }}>Email Us</p>
                <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: '#6366f1', fontWeight: 600 }}>her-2-herofficial@gmil.com</p>
              </div>
            </div>
          </a>

        </div>
      </div>

    </div>
  );
}
