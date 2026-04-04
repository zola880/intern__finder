import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useProfile } from '../hooks/useProfile';

const ApplyUniversityAdmin = () => {
  const { user } = useProfile();
  const navigate = useNavigate();
  const [form, setForm] = useState({ universityName: '', reason: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  if (!user) return <div className="p-8 text-center">Please login to apply.</div>;
  if (user.role === 'UNIVERSITY_ADMIN' || user.role === 'ADMIN') {
    return <div className="p-8 text-center">You are already an admin.</div>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/admin-applications/apply', form);
      setMessage('Application submitted successfully. You will be notified once reviewed.');
      setTimeout(() => navigate('/'), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Apply to Become a University Admin</h1>
      {message && <div className="mb-4 p-3 rounded bg-blue-100 text-blue-700">{message}</div>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block font-bold mb-2">University Name</label>
          <input
            type="text"
            required
            value={form.universityName}
            onChange={(e) => setForm({ ...form, universityName: e.target.value })}
            className="w-full p-3 border rounded-xl"
            placeholder="e.g., Addis Ababa University"
          />
        </div>
        <div>
          <label className="block font-bold mb-2">Why do you want to be a university admin?</label>
          <textarea
            required
            rows="4"
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            className="w-full p-3 border rounded-xl"
            placeholder="Explain your role, why you need access, etc."
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold"
        >
          {loading ? 'Submitting...' : 'Submit Application'}
        </button>
      </form>
    </div>
  );
};

export default ApplyUniversityAdmin;