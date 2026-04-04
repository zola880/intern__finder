import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useProfile } from '../hooks/useProfile';
import { Loader2, FileText, Building2, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const MyAnnouncements = () => {
  const { user } = useProfile();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/announcements/my-announcements');
        setAnnouncements(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetch();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white mb-6">
        My Internship Announcements
      </h1>
      <p className="text-zinc-600 dark:text-zinc-400 mb-8">
        Track the status of your internship announcements submitted to your university.
      </p>

      {announcements.length === 0 ? (
        <div className="text-center py-24 bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl border border-zinc-200 dark:border-zinc-800">
          <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-10 h-10 text-zinc-400" />
          </div>
          <p className="text-zinc-500 dark:text-zinc-400">You haven't announced any internships yet.</p>
          <Link
            to="/internships"
            className="mt-4 inline-block text-indigo-600 font-bold hover:underline"
          >
            Browse internships to announce
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((ann) => (
            <div
              key={ann._id}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                        {ann.internship.companyName}
                      </h2>
                      <p className="text-sm text-zinc-500">
                        {ann.internship.field} • {ann.internship.location}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                    <span className="font-semibold">Submitted on:</span>{' '}
                    {new Date(ann.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      ann.status === 'PENDING'
                        ? 'bg-yellow-100 text-yellow-700'
                        : ann.status === 'VERIFIED'
                        ? 'bg-green-100 text-green-700'
                        : ann.status === 'STIPEND_SENT'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {ann.status === 'STIPEND_SENT' ? 'Stipend Sent' : ann.status}
                  </span>
                  {ann.status === 'REJECTED' && (
                    <span className="text-xs text-red-600">(Review failed)</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyAnnouncements;