import React, { useState } from 'react';
import { Download, FileText, CheckCircle } from 'lucide-react';
import { adminApi } from '../../api/apiClient';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export default function AdminReports() {
  const [loadingType, setLoadingType] = useState(null);

  const fetchResource = async (type) => {
    switch(type) {
      case 'users': return await adminApi.getUsers();
      case 'doctors': return await adminApi.getDoctors();
      case 'appointments': return await adminApi.getAppointments();
      default: return [];
    }
  };

  const exportPDF = async (type) => {
    setLoadingType("pdf-" + type);
    try {
      const data = await fetchResource(type);
      const doc = new jsPDF();
      doc.text("Her2Her " + type.toUpperCase() + " Report", 14, 15);
      
      let head = [];
      let body = [];

      if (type === 'users') {
        head = [['Name', 'Email', 'Membership', 'Registered']];
        body = data.map(i => [i.name || 'Anonymous', i.email, i.membershipStatus || 'Free', new Date(i.createdAt).toLocaleDateString()]);
      } else if (type === 'doctors') {
        head = [['Name', 'Email', 'Specialty', 'Status']];
        body = data.map(i => [i.name, i.email, i.specialty || 'General', i.status || 'Unknown']);
      } else if (type === 'appointments') {
        head = [['Date', 'Patient', 'Doctor', 'Status']];
        body = data.map(i => [new Date(i.date).toLocaleDateString(), i.user?.name || 'N/A', i.expert?.name || 'N/A', i.status || 'Scheduled']);
      }

      autoTable(doc, { startY: 20, head, body });
      doc.save("Her2Her_" + type + "_report.pdf");
    } catch (err) {
      alert("Error exporting PDF: " + err.message);
    } finally {
      setLoadingType(null);
    }
  };

  const exportExcel = async (type) => {
    setLoadingType("excel-" + type);
    try {
      const data = await fetchResource(type);
      let parsedData = [];
      
      if (type === 'users') {
        parsedData = data.map(i => ({ Name: i.name, Email: i.email, Membership: i.membershipStatus, Date: i.createdAt }));
      } else if (type === 'doctors') {
        parsedData = data.map(i => ({ Name: i.name, Specialty: i.specialty, Email: i.email, Status: i.status }));
      } else if (type === 'appointments') {
        parsedData = data.map(i => ({ Date: i.date, Patient: i.user?.name, Doctor: i.expert?.name, Status: i.status }));
      }

      const worksheet = XLSX.utils.json_to_sheet(parsedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, type.toUpperCase());
      XLSX.writeFile(workbook, "Her2Her_" + type + "_report.xlsx");
    } catch (err) {
      alert("Error exporting Excel: " + err.message);
    } finally {
      setLoadingType(null);
    }
  };

  const OptionCard = ({ title, desc, type }) => (
    <div className="glass-card" style={{ padding: '24px', borderRadius: '16px', display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
      <div style={{ minWidth: '200px' }}>
        <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1f2937', marginBottom: '4px' }}>{title}</h4>
        <p style={{ color: '#6b7280', margin: 0, fontSize: '0.9rem' }}>{desc}</p>
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button 
          disabled={loadingType !== null}
          onClick={() => exportPDF(type)} 
          style={{ padding: '10px 16px', borderRadius: '12px', border: 'none', backgroundColor: 'rgba(244, 63, 94, 0.1)', color: '#F43F5E', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <FileText size={16} /> PDF
        </button>
        <button 
          disabled={loadingType !== null}
          onClick={() => exportExcel(type)} 
          style={{ padding: '10px 16px', borderRadius: '12px', border: 'none', backgroundColor: 'rgba(5, 205, 153, 0.1)', color: '#05CD99', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Download size={16} /> Excel
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ animation: 'fadeIn 0.5s ease' }}>
      <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1f2937', marginBottom: '4px' }}>Export Reports</h2>
      <p style={{ color: '#6b7280', marginBottom: '30px' }}>Download historical data for accounting and auditing purposes.</p>

      <OptionCard title="Users Report" desc="Full export of every registered patient and client." type="users" />
      <OptionCard title="Doctors Report" desc="Export all experts, pending queries, and statuses." type="doctors" />
      <OptionCard title="Appointments Details" desc="All logged consultation sessions and statuses." type="appointments" />
    </div>
  );
}
