import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useProfile } from '../hooks/useProfile';
import { Loader2, CheckCircle, XCircle, Clock, Send, Eye, FileText, AlertCircle, ShieldAlert, UserCheck } from 'lucide-react';

const UniversityDashboard = () => {
  const { user } = useProfile();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    if (user && (user.role === 'UNIVERSITY_ADMIN' || user.role === 'ADMIN')) {
      fetchAnnouncements();
    }
  }, [user]);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/announcements/university');
      let filteredData = data;
      if (user.role === 'ADMIN' && user.university) {
        filteredData = data.filter(ann => ann.student?.university === user.university);
      }
      setAnnouncements(filteredData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      await api.put(`/announcements/${id}/status`, { status: newStatus });
      fetchAnnouncements();
    } catch (err) {
      alert('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  if (!user || (user.role !== 'UNIVERSITY_ADMIN' && user.role !== 'ADMIN')) {
    return <div className="p-8 text-center">Access denied. University admin only.</div>;
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (user.role === 'UNIVERSITY_ADMIN' && !user.university) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-10 h-10 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">University Not Set</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          Your admin profile does not have a university assigned. Please contact the super admin to update your profile.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white">
          University Announcements
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 mt-1">
          Manage internship announcements from students of <strong>{user.university || 'your university'}</strong>
        </p>
      </div>

      {announcements.length === 0 ? (
        <div className="text-center py-24 bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl">
          <Clock className="w-16 h-16 text-zinc-400 mx-auto mb-4" />
          <p className="text-zinc-500 dark:text-zinc-400">No announcements from {user.university ? 'your university' : 'students'} yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {announcements.map((ann) => {
            // Determine AI verdict styling
            const aiVerdict = ann.aiVerdict;
            const isAISuspicious = aiVerdict === 'suspicious';
            const isAIInvalid = aiVerdict === 'invalid';
            const cardBorderClass = isAIInvalid ? 'border-red-300 dark:border-red-800' : 
                                     isAISuspicious ? 'border-yellow-300 dark:border-yellow-800' : 
                                     'border-zinc-200 dark:border-zinc-800';

            return (
              <div
                key={ann._id}
                className={`bg-white dark:bg-zinc-900 border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all ${cardBorderClass}`}
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                          <FileText className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                            {ann.internship.companyName}
                          </h2>
                          <p className="text-sm text-zinc-500">
                            Student: {ann.fullName} ({ann.department}, Year {ann.year})
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-semibold">Student Email:</span> {ann.student?.email || 'N/A'}
                        </div>
                        <div>
                          <span className="font-semibold">Bank Account:</span> {ann.bankAccount}
                        </div>
                        <div>
                          <span className="font-semibold">Acceptance Letter:</span>{' '}
                          <a
                            href={ann.acceptanceLetterUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:underline flex items-center gap-1"
                          >
                            View Document <Eye className="w-3 h-3" />
                          </a>
                        </div>
                        {ann.studentIdPhotoUrl && (
                          <div>
                            <span className="font-semibold">Student ID:</span>{' '}
                            <a
                              href={ann.studentIdPhotoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 hover:underline flex items-center gap-1"
                            >
                              View ID <Eye className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                        {/* AI verdict section */}
                        <div className="md:col-span-2 mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                          <div className="flex items-center gap-2">
                            {aiVerdict === 'valid' && <UserCheck className="w-4 h-4 text-green-600" />}
                            {aiVerdict === 'suspicious' && <ShieldAlert className="w-4 h-4 text-yellow-600" />}
                            {aiVerdict === 'invalid' && <AlertCircle className="w-4 h-4 text-red-600" />}
                            <span className="font-semibold">AI Verdict:</span>
                            <span className={`${aiVerdict === 'valid' ? 'text-green-600' : aiVerdict === 'suspicious' ? 'text-yellow-600' : 'text-red-600'}`}>
                              {aiVerdict ? aiVerdict.toUpperCase() : 'N/A'}
                            </span>
                            {ann.aiConfidence && <span className="text-xs text-zinc-500">(Confidence: {ann.aiConfidence}%)</span>}
                          </div>
                          {ann.aiNotes && <div className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">AI Notes: {ann.aiNotes}</div>}
                          {ann.adminNotes && ann.status === 'REJECTED' && (
                            <div className="mt-2 text-xs text-red-600">Admin Note: {ann.adminNotes}</div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-3">
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
                        {ann.status}
                      </span>

                      <div className="flex gap-2 mt-2">
                        {ann.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => updateStatus(ann._id, 'VERIFIED')}
                              disabled={updatingId === ann._id}
                              className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                            >
                              {updatingId === ann._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                              Verify
                            </button>
                            <button
                              onClick={() => updateStatus(ann._id, 'REJECTED')}
                              disabled={updatingId === ann._id}
                              className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                            >
                              <XCircle className="w-4 h-4" />
                              Reject
                            </button>
                          </>
                        )}
                        {ann.status === 'VERIFIED' && (
                          <button
                            onClick={() => updateStatus(ann._id, 'STIPEND_SENT')}
                            disabled={updatingId === ann._id}
                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                          >
                            <Send className="w-4 h-4" />
                            Mark Stipend Sent
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UniversityDashboard;