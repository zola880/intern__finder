import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, XCircle, Clock, RefreshCw, Loader2, 
  AlertCircle, Building2, Eye, UserPlus, Users 
} from 'lucide-react';
import api from '../services/api';
import { useProfile } from '../hooks/useProfile';

const AdminDashboard = () => {
  const { user } = useProfile();
  const [pendingInternships, setPendingInternships] = useState([]);
  const [approvedInternships, setApprovedInternships] = useState([]);
  const [rejectedInternships, setRejectedInternships] = useState([]);
  const [applications, setApplications] = useState([]);
  const [applicationsFilter, setApplicationsFilter] = useState('PENDING');
  const [activeTab, setActiveTab] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [notification, setNotification] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ show: false, id: null, action: null });

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchAllData();
    }
  }, [user]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [pendingRes, approvedRes, rejectedRes, appsRes] = await Promise.all([
        api.get('/internships?approvalStatus=PENDING'),
        api.get('/internships?approvalStatus=APPROVED'),
        api.get('/internships?approvalStatus=REJECTED'),
        api.get('/admin-applications'),
      ]);
      setPendingInternships(pendingRes.data.data);
      setApprovedInternships(approvedRes.data.data);
      setRejectedInternships(rejectedRes.data.data);
      setApplications(appsRes.data);
    } catch (err) {
      console.error(err);
      showNotification('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async (status = applicationsFilter) => {
    try {
      const { data } = await api.get(`/admin-applications?status=${status}`);
      setApplications(data);
    } catch (err) {
      console.error(err);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleApproveInternship = async (id) => {
    setActionLoading(id);
    try {
      await api.put(`/internships/${id}/approve`);
      showNotification('Internship approved successfully!', 'success');
      fetchAllData();
    } catch (err) {
      showNotification('Failed to approve internship', 'error');
    } finally {
      setActionLoading(null);
      setConfirmDialog({ show: false, id: null, action: null });
    }
  };

  const handleRejectInternship = async (id, reason) => {
    setActionLoading(id);
    try {
      await api.put(`/internships/${id}/reject`, { reason });
      showNotification('Internship rejected', 'success');
      fetchAllData();
    } catch (err) {
      showNotification('Failed to reject internship', 'error');
    } finally {
      setActionLoading(null);
      setConfirmDialog({ show: false, id: null, action: null });
    }
  };

  const handleApproveApplication = async (id) => {
    setActionLoading(id);
    try {
      await api.put(`/admin-applications/${id}/approve`);
      showNotification('Application approved – user is now a university admin.', 'success');
      fetchAllData();
      fetchApplications(applicationsFilter);
    } catch (err) {
      showNotification('Failed to approve application', 'error');
    } finally {
      setActionLoading(null);
      setConfirmDialog({ show: false, id: null, action: null });
    }
  };

  const handleRejectApplication = async (id) => {
    const reason = prompt('Reason for rejection:');
    if (!reason) return;
    setActionLoading(id);
    try {
      await api.put(`/admin-applications/${id}/reject`, { reason });
      showNotification('Application rejected', 'success');
      fetchAllData();
      fetchApplications(applicationsFilter);
    } catch (err) {
      showNotification('Failed to reject application', 'error');
    } finally {
      setActionLoading(null);
      setConfirmDialog({ show: false, id: null, action: null });
    }
  };

  const openConfirmDialog = (id, type, action) => {
    if (type === 'internship') {
      if (action === 'reject') {
        const reason = prompt('Please provide a reason for rejection:');
        if (reason) handleRejectInternship(id, reason);
      } else {
        setConfirmDialog({ show: true, id, action: 'approveInternship' });
      }
    } else if (type === 'application') {
      if (action === 'reject') {
        handleRejectApplication(id);
      } else {
        setConfirmDialog({ show: true, id, action: 'approveApplication' });
      }
    }
  };

  const getCurrentList = () => {
    if (activeTab === 'pending') return pendingInternships;
    if (activeTab === 'approved') return approvedInternships;
    if (activeTab === 'rejected') return rejectedInternships;
    return [];
  };

  const getFilteredApplications = () => applications.filter(app => app.status === applicationsFilter);
  const getTabCount = (tab) => {
    if (tab === 'pending') return pendingInternships.length;
    if (tab === 'approved') return approvedInternships.length;
    if (tab === 'rejected') return rejectedInternships.length;
    return 0;
  };
  const getApplicationsCount = (status) => applications.filter(app => app.status === status).length;

  if (user?.role !== 'ADMIN') {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-10 h-10 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Access Denied</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mt-2">You don't have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-20 right-4 z-50 px-5 py-3 rounded-2xl shadow-lg flex items-center gap-2 text-sm ${
              notification.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
            }`}
          >
            {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
            <span>{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Dialog */}
      {confirmDialog.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-zinc-900 rounded-2xl p-6 max-w-md w-full shadow-xl"
          >
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
              {confirmDialog.action === 'approveInternship' ? 'Confirm Approval' : 'Confirm Approval'}
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6">
              {confirmDialog.action === 'approveInternship' 
                ? 'Are you sure you want to approve this internship? It will become visible to all students.'
                : 'Are you sure you want to approve this application? The user will become a university admin.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <button
                onClick={() => setConfirmDialog({ show: false, id: null, action: null })}
                className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (confirmDialog.action === 'approveInternship') handleApproveInternship(confirmDialog.id);
                  else if (confirmDialog.action === 'approveApplication') handleApproveApplication(confirmDialog.id);
                }}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold"
              >
                Approve
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white flex items-center gap-3">
            <Building2 className="w-7 h-7 sm:w-8 sm:h-8 text-indigo-600" />
            Admin Dashboard
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">Manage internship submissions and university admin applications</p>
        </div>
        <button
          onClick={fetchAllData}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-md disabled:opacity-50 w-full sm:w-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Main Tabs – scrollable on mobile */}
      <div className="overflow-x-auto pb-2 mb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex gap-1 sm:gap-2 min-w-max">
          {[
            { id: 'pending', label: 'Pending Internships', icon: Clock },
            { id: 'approved', label: 'Approved Internships', icon: CheckCircle2 },
            { id: 'rejected', label: 'Rejected Internships', icon: XCircle },
            { id: 'applications', label: 'Admin Applications', icon: UserPlus },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-bold transition-all border-b-2 -mb-[2px] ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.id !== 'applications' && (
                <span className="ml-1 px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-full text-[10px]">
                  {getTabCount(tab.id)}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        </div>
      ) : activeTab !== 'applications' ? (
        // Internships Section
        <>
          {getCurrentList().length === 0 ? (
            <div className="text-center py-16 sm:py-24 bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl">
              <Clock className="w-12 h-12 text-zinc-400 mx-auto mb-3" />
              <p className="text-zinc-500">No {activeTab} internships found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:gap-6">
              {getCurrentList().map((internship) => (
                <motion.div
                  key={internship._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm hover:shadow-md transition-all"
                >
                  <div className="p-4 sm:p-5 md:p-6">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center text-indigo-600 font-bold text-base sm:text-lg">
                            {internship.companyName.charAt(0)}
                          </div>
                          <div>
                            <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white break-words">
                              {internship.companyName}
                            </h2>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                              Submitted by: {internship.submittedBy?.fullName || 'Unknown'} • {new Date(internship.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">{internship.shortDescription}</p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 text-xs rounded-full">{internship.field}</span>
                          <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 text-xs rounded-full">{internship.location}</span>
                          <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 text-xs rounded-full">{internship.duration}</span>
                        </div>
                        {internship.adminNotes && activeTab === 'rejected' && (
                          <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/10 rounded-xl text-xs text-red-700">
                            <strong>Rejection reason:</strong> {internship.adminNotes}
                          </div>
                        )}
                      </div>
                      {/* Action buttons – column on mobile */}
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 items-end">
                        <button
                          onClick={() => window.open(`/internships/${internship._id}`, '_blank')}
                          className="p-2 rounded-lg text-zinc-500 hover:text-indigo-600 transition-colors min-w-[44px] min-h-[44px]"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        {activeTab === 'pending' && (
                          <>
                            <button
                              onClick={() => openConfirmDialog(internship._id, 'internship', 'approve')}
                              disabled={actionLoading === internship._id}
                              className="flex items-center justify-center gap-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold min-w-[100px]"
                            >
                              {actionLoading === internship._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                              Approve
                            </button>
                            <button
                              onClick={() => openConfirmDialog(internship._id, 'internship', 'reject')}
                              disabled={actionLoading === internship._id}
                              className="flex items-center justify-center gap-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold min-w-[100px]"
                            >
                              {actionLoading === internship._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </>
      ) : (
        // Applications Section
        <div>
          {/* Sub-tabs scrollable */}
          <div className="overflow-x-auto pb-2 mb-6 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex gap-1 sm:gap-2 min-w-max">
              {['PENDING', 'APPROVED', 'REJECTED'].map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    setApplicationsFilter(status);
                    fetchApplications(status);
                  }}
                  className={`px-4 py-2 text-sm font-medium transition-all border-b-2 -mb-[2px] ${
                    applicationsFilter === status
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-zinc-500 hover:text-zinc-700'
                  }`}
                >
                  {status.charAt(0) + status.slice(1).toLowerCase()}
                  <span className="ml-2 px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-full text-xs">
                    {getApplicationsCount(status)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {getFilteredApplications().length === 0 ? (
            <div className="text-center py-16 sm:py-24 bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl">
              <Users className="w-12 h-12 text-zinc-400 mx-auto mb-3" />
              <p className="text-zinc-500">No {applicationsFilter.toLowerCase()} applications</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:gap-6">
              {getFilteredApplications().map((app) => (
                <motion.div
                  key={app._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm hover:shadow-md transition-all"
                >
                  <div className="p-4 sm:p-5 md:p-6">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex items-center justify-center">
                            <UserPlus className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
                          </div>
                          <div>
                            <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white break-words">
                              {app.applicant.fullName}
                            </h2>
                            <p className="text-xs text-zinc-500">
                              {app.applicant.email} • Applied {new Date(app.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 space-y-2 text-sm">
                          <div>
                            <span className="font-semibold">University requested:</span>
                            <p className="text-zinc-600 dark:text-zinc-400 break-words">{app.universityName}</p>
                          </div>
                          <div>
                            <span className="font-semibold">Reason:</span>
                            <p className="text-zinc-600 dark:text-zinc-400 mt-1 text-sm leading-relaxed">{app.reason}</p>
                          </div>
                          {app.adminNotes && app.status === 'REJECTED' && (
                            <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/10 rounded-xl text-xs text-red-700">
                              <strong>Rejection reason:</strong> {app.adminNotes}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 items-end">
                        {app.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => openConfirmDialog(app._id, 'application', 'approve')}
                              disabled={actionLoading === app._id}
                              className="flex items-center justify-center gap-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold min-w-[100px]"
                            >
                              {actionLoading === app._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                              Approve
                            </button>
                            <button
                              onClick={() => openConfirmDialog(app._id, 'application', 'reject')}
                              disabled={actionLoading === app._id}
                              className="flex items-center justify-center gap-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold min-w-[100px]"
                            >
                              <XCircle className="w-4 h-4" />
                              Reject
                            </button>
                          </>
                        )}
                        {app.status !== 'PENDING' && (
                          <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                            app.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {app.status}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;