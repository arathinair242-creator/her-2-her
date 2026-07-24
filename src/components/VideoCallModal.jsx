import React, { useState, useEffect, useRef } from 'react';
import { X, Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, Settings, Maximize, User, Loader2 } from 'lucide-react';
import io from 'socket.io-client';
import Peer from 'simple-peer';

const SOCKET_URL = process.env.NODE_ENV === 'production' 
  ? 'https://her-2-her.onrender.com' 
  : (window.location.hostname === 'localhost' ? 'http://localhost:5001' : 'https://her-2-her.onrender.com');

export default function VideoCallModal({ expert, user, onClose, appointmentId = 'default-room' }) {
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [connecting, setConnecting] = useState(true);
  const [error, setError] = useState(null);
  const [stream, setStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  const socketRef = useRef();
  const myVideoRef = useRef();
  const remoteVideoRef = useRef();
  const peerRef = useRef();

  useEffect(() => {
    const initCall = async () => {
      try {
        console.log('Initializing local media stream...');
        const userStream = await navigator.mediaDevices.getUserMedia({ 
          video: videoOn, 
          audio: micOn 
        });
        
        console.log('Media stream acquired successfully');
        setStream(userStream);
        if (myVideoRef.current) {
          myVideoRef.current.srcObject = userStream;
          myVideoRef.current.play().catch(e => console.log('Video play error:', e));
        }

        socketRef.current = io(SOCKET_URL);
        console.log('Socket connecting to:', SOCKET_URL, 'Room ID:', appointmentId);

        socketRef.current.on('connect', () => {
          console.log('Socket connected! ID:', socketRef.current.id);
          socketRef.current.emit('join-room', appointmentId);
        });

        socketRef.current.on('user-connected', (userId) => {
          console.log('Peer connected to room:', userId);
          callUser(userId, userStream);
        });

        socketRef.current.on('signal', (data) => {
          console.log('Received signal from:', data.from);
          if (peerRef.current) {
            peerRef.current.signal(data.signal);
          } else {
            console.log('Receiving incoming call, answering...');
            answerCall(data.signal, userStream, data.from);
          }
        });

        setConnecting(false);
      } catch (err) {
        console.error("Video Call Error:", err);
        setError(`Media error: ${err.message}. Please check camera/mic permissions and ensure you are on localhost or HTTPS.`);
        setConnecting(false);
      }
    };

    initCall();

    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    return () => {
      clearInterval(timer);
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (socketRef.current) socketRef.current.disconnect();
      if (peerRef.current) peerRef.current.destroy();
    };
  }, [appointmentId]);

  const callUser = (userId, userStream) => {
    peerRef.current = new Peer({
      initiator: true,
      trickle: false,
      stream: userStream,
    });

    peerRef.current.on('signal', (data) => {
      socketRef.current.emit('signal', {
        roomId: appointmentId,
        signal: data,
        to: userId
      });
    });

    peerRef.current.on('stream', (remoteStream) => {
      setRemoteStream(remoteStream);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
    });
  };

  const answerCall = (incomingSignal, userStream, fromId) => {
    peerRef.current = new Peer({
      initiator: false,
      trickle: false,
      stream: userStream,
    });

    peerRef.current.on('signal', (data) => {
      console.log('Sending answer signal...');
      socketRef.current.emit('signal', {
        roomId: appointmentId,
        signal: data,
        to: fromId
      });
    });

    peerRef.current.on('stream', (remoteStream) => {
      console.log('Remote stream received (answer side)');
      setRemoteStream(remoteStream);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
    });

    peerRef.current.signal(incomingSignal);
  };

  const toggleMic = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !micOn;
        setMicOn(!micOn);
      }
    }
  };

  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoOn;
        setVideoOn(!videoOn);
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (error) {
    return (
      <div className="video-call-overlay" style={{ backgroundColor: '#0a0a1a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', textAlign: 'center' }}>
        <div className="glass-card" style={{ padding: '40px', maxWidth: '400px' }}>
          <AlertCircle size={48} color="#f43f5e" style={{ marginBottom: '20px' }} />
          <h3>Connection Error</h3>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '24px' }}>{error}</p>
          <button className="btn-primary" onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="video-call-overlay" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: '#0a0a1a', zIndex: 9999, display: 'flex', flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: connecting ? '#FFA620' : '#05CD99', marginRight: '4px' }} className={connecting ? "animate-pulse" : ""} />
            <span style={{ color: 'white', fontWeight: 600, fontSize: '0.9rem' }}>{connecting ? 'Connecting...' : 'Live Consult'}</span>
          </div>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>{formatTime(callDuration)}</span>
        </div>
        <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '8px', borderRadius: '50%', cursor: 'pointer' }}>
          <Maximize size={18} />
        </button>
      </div>

      {/* Main Video Area */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {connecting ? (
          <div style={{ textAlign: 'center', color: 'white' }}>
            <Loader2 size={48} className="animate-spin" style={{ color: 'var(--secondary-violet)', marginBottom: '16px' }} />
            <h3>Initializing Connection</h3>
            <p style={{ color: 'rgba(255,255,255,0.6)' }}>Setting up secure video link...</p>
          </div>
        ) : (
          <>
            {/* Remote Feed (Primary) */}
            <div style={{ width: '100%', height: '100%', backgroundColor: '#0a0a1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {remoteStream ? (
                <video ref={remoteVideoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ textAlign: 'center', color: 'white' }}>
                  <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <User size={64} style={{ opacity: 0.5 }} />
                  </div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{expert?.name || user?.name || 'Waiting for other participant...'}</h2>
                  <p style={{ color: 'rgba(255,255,255,0.6)' }}>Participant has not joined or camera is off</p>
                </div>
              )}
            </div>

            {/* Local Mini Feed */}
            <div style={{
              position: 'absolute', bottom: '30px', right: '30px',
              width: '200px', height: '130px', borderRadius: '16px',
              overflow: 'hidden', border: '2px solid rgba(255,255,255,0.2)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
              backgroundColor: '#1a1a2e'
            }}>
              <video 
                ref={(el) => {
                  myVideoRef.current = el;
                  if (el && stream && el.srcObject !== stream) {
                    el.srcObject = stream;
                    el.play().catch(e => console.log('Video play error:', e));
                  }
                }} 
                autoPlay 
                muted 
                playsInline 
                style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} 
              />
              {!videoOn && (
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: '#1a1a2e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <VideoOff size={24} style={{ color: 'rgba(255,255,255,0.4)' }} />
                </div>
              )}
            </div>
          </>
        )}

        {/* Info Overlay */}
        {!connecting && (
          <div style={{ position: 'absolute', top: '30px', right: '30px', textAlign: 'right' }}>
            <h3 style={{ color: 'white', margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>{expert?.name || user?.name}</h3>
            <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0, fontSize: '0.9rem' }}>{expert?.specialization || 'Patient'}</p>
          </div>
        )}
      </div>

      {/* Controls Bar */}
      <div style={{ padding: '40px', display: 'flex', justifyContent: 'center', gap: '20px', background: 'linear-gradient(transparent, rgba(0,0,0,0.8))' }}>
        <button 
          onClick={toggleMic}
          style={{ width: '56px', height: '56px', borderRadius: '50%', background: micOn ? 'rgba(255,255,255,0.1)' : '#f43f5e', border: 'none', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
          {micOn ? <Mic size={24} /> : <MicOff size={24} />}
        </button>
        <button 
          onClick={toggleVideo}
          style={{ width: '56px', height: '56px', borderRadius: '50%', background: videoOn ? 'rgba(255,255,255,0.1)' : '#f43f5e', border: 'none', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
          {videoOn ? <VideoIcon size={24} /> : <VideoOff size={24} />}
        </button>
        <button 
          onClick={onClose}
          style={{ width: '70px', height: '56px', borderRadius: '28px', background: '#f43f5e', border: 'none', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 8px 16px rgba(244,63,94,0.3)' }}>
          <PhoneOff size={24} />
        </button>
        <button style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Settings size={24} />
        </button>
      </div>
    </div>
  );
}

// Helper icons
function AlertCircle({ size, color, ...props }) {
    return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
}
