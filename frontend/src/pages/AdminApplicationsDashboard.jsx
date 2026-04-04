import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useProfile } from '../hooks/useProfile';
import { Loader2 } from 'lucide-react';

const AdminApplicationsDashboard = () => {
  const { user } = useProfile();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('PENDING');

  useEffect(() => {
    if (user?.role === 'ADMIN') fetchApplications();
  }, [user, filter]);

  const fetchApplications = async () => {
    try {
      const { data } = await api.get(`/admin-applications?status=${filter}`);
      setApplications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    await api.put(`/admin-applications/${id}/approve`);
    fetchApplications();
  };

  const handleReject = async (id) => {
    const reason = prompt('Reason for rejection:');
    if (reason) {
      await api.put(`/admin-applications/${id}/reject`, { reason });
      fetchApplications();
    }
  };

  if (user?.role !== 'ADMIN') return <div className="p-8 text-center">Admin access only</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">University Admin Applications</h1>
      <div className="flex gap-2 mb-6">
        <button onClick={() => setFilter('PENDING')} className={`px-4 py-2 rounded ${filter === 'PENDING' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}>Pending</button>
        <button onClick={() => setFilter('APPROVED')} className={`px-4 py-2 rounded ${filter === 'APPROVED' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}>Approved</button>
        <button onClick={() => setFilter('REJECTED')} className={`px-4 py-2 rounded ${filter === 'REJECTED' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}>Rejected</button>
      </div>
      {loading ? <Loader2 className="animate-spin" /> : (
        <div className="space-y-6">
          {applications.map(app => (
            <div key={app._id} className="border rounded-xl p-6">
              <p><strong>Applicant:</strong> {app.applicant.fullName} ({app.applicant.email})</p>
              <p><strong>University:</strong> {app.universityName}</p>
              <p><strong>Reason:</strong> {app.reason}</p>
              <p><strong>Status:</strong> {app.status}</p>
              {app.status === 'PENDING' && (
                <div className="mt-4 flex gap-3">
                  <button onClick={() => handleApprove(app._id)} className="bg-green-600 text-white px-4 py-2 rounded">Approve</button>
                  <button onClick={() => handleReject(app._id)} className="bg-red-600 text-white px-4 py-2 rounded">Reject</button>
                </div>
              )}
              {app.adminNotes && <p className="mt-2 text-red-600">Rejection note: {app.adminNotes}</p>}
            </div>
          ))}
          {applications.length === 0 && <p>No applications.</p>}
        </div>
      )}
    </div>
  );
};

export default AdminApplicationsDashboard;