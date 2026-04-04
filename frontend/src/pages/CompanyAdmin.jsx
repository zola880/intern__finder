import React, { useState, useEffect } from 'react';
import { useProfile } from '../hooks/useProfile';
import api from '../services/api';

export default function CompanyAdmin() {
  const { user } = useProfile();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user || (user.role !== 'EMPLOYER' && user.role !== 'ADMIN' && user.role !== 'UNIVERSITY_ADMIN')) {
      setLoading(false);
      return;
    }

    const fetchApplications = async () => {
      setLoading(true);
      try {
        // Example endpoint, implement backend route if missing
        const res = await api.get('/profiles/for-companies');
        if (Array.isArray(res.data)) setApplications(res.data);
        else if (res.data?.data) setApplications(res.data.data);
        else setApplications([]);
      } catch (err) {
        console.error(err);
        setError('Unable to fetch profile candidate feed.');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [user]);

  if (!user || (user.role !== 'EMPLOYER' && user.role !== 'ADMIN' && user.role !== 'UNIVERSITY_ADMIN')) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p className="mt-2 text-zinc-600">Only company/recruiter users can view this page.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-extrabold mb-4">Company Admin</h1>
      <p className="text-zinc-600 dark:text-zinc-400 mb-6">Candidate profile feed and action center.</p>

      {loading && <p className="py-8 text-center">Loading users...</p>}
      {error && <p className="py-8 text-center text-red-600 dark:text-red-400">{error}</p>}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {applications.length === 0 ? (
            <div className="col-span-full text-center py-8 text-zinc-500">No candidates available yet.</div>
          ) : applications.map((candidate) => (
            <div key={candidate._id || candidate.id} className="p-4 border rounded-xl bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
              <h2 className="font-bold text-lg">{candidate.fullName || candidate.name}</h2>
              <p className="text-sm text-zinc-500 mt-1">{candidate.university || candidate.company || 'No organization'}</p>
              <p className="text-zinc-600 dark:text-zinc-300 mt-2 text-sm">{candidate.goal || candidate.summary || 'Profile summary not available.'}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {(candidate.interests || []).slice(0,3).map((tag) => (
                  <span key={tag} className="text-xs px-2 py-1 rounded-full bg-indigo-50 text-indigo-700">{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
