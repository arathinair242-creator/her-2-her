import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Check, Search, Eye, EyeOff } from 'lucide-react';
import { expertApi } from '../api/apiClient';

export default function AdminDoctorManagement() {
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingExpert, setEditingExpert] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    specialization: 'Gynecologist',
    experience: '',
    qualification: '',
    phone: '',
    consultationFee: '',
    aboutMe: '',
    status: 'Verified'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetchExperts();
  }, []);

  const fetchExperts = async () => {
    try {
      const data = await expertApi.getExperts({ status: 'all' });
      setExperts(data);
    } catch (err) {
      console.error("Error fetching experts:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingExpert) {
        await expertApi.updateExpert(editingExpert._id, formData);
      } else {
        await expertApi.addExpert(formData);
      }
      fetchExperts();
      closeModal();
    } catch (err) {
      alert("Error saving expert: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this expert?")) {
      try {
        await expertApi.deleteExpert(id);
        fetchExperts();
      } catch (err) {
        alert("Error deleting expert: " + err.message);
      }
    }
  };

  const openModal = (expert = null) => {
    setShowPassword(false);
    if (expert) {
      setEditingExpert(expert);
      setFormData({
        name: expert.name,
        email: expert.email,
        password: 'password', // Placeholder
        specialization: expert.specialization,
        experience: expert.experience || '',
        qualification: expert.qualification || '',
        phone: expert.phone || '',
        consultationFee: expert.consultationFee || '',
        aboutMe: expert.aboutMe || '',
        status: expert.status || 'Verified'
      });
    } else {
      setEditingExpert(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        specialization: 'Gynecologist',
        experience: '',
        qualification: '',
        phone: '',
        consultationFee: '',
        aboutMe: '',
        status: 'Verified'
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingExpert(null);
  };

  const filteredExperts = experts.filter(exp => 
    exp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exp.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-container" style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-dark)' }}>Doctor Management</h2>
        <button className="btn-primary" onClick={() => openModal()} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={20} /> Add New Doctor
        </button>
      </div>

      <div style={{ marginBottom: '20px', position: 'relative' }}>
        <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={20} />
        <input 
          type="text" 
          placeholder="Search by name or specialization..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '12px 12px 12px 42px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem' }}
        />
      </div>

      <div className="glass-card" style={{ padding: '0', overflow: 'hidden', borderRadius: '16px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: 'rgba(124, 92, 255, 0.05)', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '16px' }}>Name</th>
              <th style={{ padding: '16px' }}>Specialization</th>
              <th style={{ padding: '16px' }}>Email</th>
              <th style={{ padding: '16px' }}>Fee</th>
              <th style={{ padding: '16px' }}>Status</th>
              <th style={{ padding: '16px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{ padding: '40px', textAlign: 'center' }}>Loading experts...</td></tr>
            ) : filteredExperts.length === 0 ? (
              <tr><td colSpan="6" style={{ padding: '40px', textAlign: 'center' }}>No doctors found.</td></tr>
            ) : (
              filteredExperts.map(exp => (
                <tr key={exp._id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '16px', fontWeight: 600 }}>{exp.name}</td>
                  <td style={{ padding: '16px' }}><span className="tag">{exp.specialization}</span></td>
                  <td style={{ padding: '16px' }}>{exp.email}</td>
                  <td style={{ padding: '16px' }}>${exp.consultationFee || 0}</td>
                  <td style={{ padding: '16px' }}>
                    <span 
                      style={{ 
                        padding: '4px 8px', 
                        borderRadius: '12px', 
                        fontSize: '0.75rem', 
                        fontWeight: 700, 
                        backgroundColor: exp.status === 'Verified' ? '#ecfdf5' : '#fffbeb', 
                        color: exp.status === 'Verified' ? '#10b981' : '#f59e0b' 
                      }}
                    >
                      {exp.status || 'Pending'}
                    </span>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => openModal(exp)} style={{ border: 'none', background: '#f1f5f9', padding: '8px', borderRadius: '8px', cursor: 'pointer', color: '#64748b' }}>
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(exp._id)} style={{ border: 'none', background: '#fee2e2', padding: '8px', borderRadius: '8px', cursor: 'pointer', color: '#ef4444' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" style={{ zIndex: 2000 }}>
          <div className="modal-card glass-card" style={{ maxWidth: '600px', width: '90%' }}>
            <button className="modal-close-btn" onClick={closeModal}><X size={20} /></button>
            <h3 className="modal-title">{editingExpert ? 'Edit Doctor' : 'Add New Doctor'}</h3>
            
            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="modal-form-group">
                <label>Full Name</label>
                <input name="name" value={formData.name} onChange={handleInputChange} className="modal-form-input" required />
              </div>
              <div className="modal-form-group">
                <label>Email</label>
                <input name="email" type="email" value={formData.email} onChange={handleInputChange} className="modal-form-input" required />
              </div>
              {!editingExpert && (
                <div className="modal-form-group">
                  <label>Password</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input name="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={handleInputChange} className="modal-form-input" style={{ paddingRight: '40px', width: '100%' }} required />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', right: '14px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              )}
              <div className="modal-form-group">
                <label>Specialization</label>
                <select name="specialization" value={formData.specialization} onChange={handleInputChange} className="modal-form-input">
                  <option value="Gynecologist">Gynecologist</option>
                  <option value="Nutritionist">Nutritionist</option>
                  <option value="Fitness Trainer">Fitness Trainer</option>
                </select>
              </div>
              <div className="modal-form-group">
                <label>Qualification</label>
                <input name="qualification" value={formData.qualification} onChange={handleInputChange} className="modal-form-input" />
              </div>
              <div className="modal-form-group">
                <label>Experience (Years)</label>
                <input name="experience" value={formData.experience} onChange={handleInputChange} className="modal-form-input" />
              </div>
              <div className="modal-form-group">
                <label>Phone Number</label>
                <input name="phone" value={formData.phone} onChange={handleInputChange} className="modal-form-input" />
              </div>
              <div className="modal-form-group">
                <label>Consultation Fee ($)</label>
                <input name="consultationFee" type="number" value={formData.consultationFee} onChange={handleInputChange} className="modal-form-input" />
              </div>
              {editingExpert && (
                <div className="modal-form-group">
                  <label>Verification Status</label>
                  <select name="status" value={formData.status} onChange={handleInputChange} className="modal-form-input" style={{ fontWeight: 700, color: formData.status === 'Verified' ? 'var(--teal-accent)' : 'var(--orange-accent)' }}>
                    <option value="Pending">Pending</option>
                    <option value="Verified">Verified</option>
                  </select>
                </div>
              )}
              <div className="modal-form-group" style={{ gridColumn: 'span 2' }}>
                <label>Bio / About Me</label>
                <textarea name="aboutMe" value={formData.aboutMe} onChange={handleInputChange} className="modal-form-input" rows="3" />
              </div>
              {editingExpert && (
                <div className="modal-form-group" style={{ gridColumn: 'span 2' }}>
                  <label>Uploaded Documents</label>
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '0.85rem' }}>
                    {editingExpert.profilePicture ? <a href={`http://localhost:5001${editingExpert.profilePicture}`} target="_blank" rel="noreferrer" style={{ color: 'var(--primary-pink)', fontWeight: 600 }}>Profile Photo</a> : <span style={{ color: '#94a3b8' }}>No Profile Photo</span>}
                    {editingExpert.degreeCertificate ? <a href={`http://localhost:5001${editingExpert.degreeCertificate}`} target="_blank" rel="noreferrer" style={{ color: 'var(--primary-pink)', fontWeight: 600 }}>Degree Certificate</a> : <span style={{ color: '#94a3b8' }}>No Degree</span>}
                    {editingExpert.governmentId ? <a href={`http://localhost:5001${editingExpert.governmentId}`} target="_blank" rel="noreferrer" style={{ color: 'var(--primary-pink)', fontWeight: 600 }}>Government ID</a> : <span style={{ color: '#94a3b8' }}>No Govt ID</span>}
                    {editingExpert.medicalRegistration ? <a href={`http://localhost:5001${editingExpert.medicalRegistration}`} target="_blank" rel="noreferrer" style={{ color: 'var(--primary-pink)', fontWeight: 600 }}>Medical Registration</a> : <span style={{ color: '#94a3b8' }}>No Med Reg</span>}
                  </div>
                </div>
              )}
              <div className="modal-actions" style={{ gridColumn: 'span 2' }}>
                <button type="button" className="btn-modal-cancel" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn-modal-submit">{editingExpert ? 'Update' : 'Add'} Doctor</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
