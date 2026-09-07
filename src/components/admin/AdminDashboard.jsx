import React, { useState, useEffect } from 'react';
import { Users, Stethoscope, Building, Calendar, Activity, AlertCircle, RefreshCw } from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { adminApi } from '../../api/apiClient';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [statsData, analyticsData] = await Promise.all([
        adminApi.getStats(),
        adminApi.getAnalytics()
      ]);
      setStats(statsData);
      setAnalytics(analyticsData);
    } catch (err) {
      console.error("Dashboard Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    fetchData();
  };

  useEffect(() => {
    handleRefresh();
  }, []);

  if (loading && !stats) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <Activity size={40} className="animate-pulse-soft" color="#7c3aed" />
    </div>;
  }

  const COLORS = ['#FF4B8B', '#7C5CFF', '#05CD99', '#FFA620'];

  return (
    <div style={{ animation: 'fadeIn 0.5s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1f2937', marginBottom: '4px' }}>Admin Dashboard</h2>
          <p style={{ color: '#6b7280', margin: 0 }}>Real-time overview of platform activity and metrics.</p>
        </div>
        <button 
          onClick={handleRefresh}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', 
            backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px',
            color: '#4b5563', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s ease',
            boxShadow: '0 2px 5px rgba(0,0,0,0.02)'
          }}
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} color="#7c3aed" /> 
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        
        <div className="glass-card" style={{ padding: '24px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '4px solid #7c3aed' }}>
          <div style={{ padding: '12px', background: 'rgba(124, 58, 237, 0.1)', borderRadius: '12px', color: '#7c3aed' }}>
            <Users size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: 0, fontWeight: 600 }}>Total Users</p>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0, color: '#1f2937' }}>{stats?.totalUsers || 0}</h3>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '24px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '4px solid #FF4B8B' }}>
          <div style={{ padding: '12px', background: 'rgba(255, 75, 139, 0.1)', borderRadius: '12px', color: '#FF4B8B' }}>
            <Stethoscope size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: 0, fontWeight: 600 }}>Total Doctors</p>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0, color: '#1f2937' }}>{stats?.totalDoctors || 0}</h3>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '24px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '4px solid #FFA620' }}>
          <div style={{ padding: '12px', background: 'rgba(255, 166, 32, 0.1)', borderRadius: '12px', color: '#FFA620' }}>
            <AlertCircle size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: 0, fontWeight: 600 }}>Pending Approvals</p>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0, color: '#1f2937' }}>{stats?.pendingDoctors || 0}</h3>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '24px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '4px solid #05CD99' }}>
          <div style={{ padding: '12px', background: 'rgba(5, 205, 153, 0.1)', borderRadius: '12px', color: '#05CD99' }}>
            <Calendar size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: 0, fontWeight: 600 }}>Active Appointments</p>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0, color: '#1f2937' }}>{stats?.activeConsultations || 0}</h3>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        
        <div className="glass-card" style={{ padding: '24px', borderRadius: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1f2937', marginBottom: '20px' }}>User Registration Flow</h3>
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics?.userRegistrations || []} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
                  itemStyle={{ color: '#7c3aed', fontWeight: 600 }}
                />
                <Line type="monotone" dataKey="Users" stroke="#7c3aed" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '24px', borderRadius: '16px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1f2937', marginBottom: '20px' }}>Consultation Breakdown</h3>
          <div style={{ flex: 1, minHeight: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics?.consultationCategories || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(analytics?.consultationCategories || []).map((entry, index) => (
                    <Cell key={"cell-" + index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
      </div>
    </div>
  );
}
