import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useProfile } from '../hooks/useProfile';

export default function CompanyHome() {
  const { user } = useProfile();
  const navigate = useNavigate();

  if (!user || (user.role !== 'EMPLOYER' && user.role !== 'ADMIN' && user.role !== 'UNIVERSITY_ADMIN')) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p className="mt-2 text-zinc-600">This page is available only for recruiter/company accounts.</p>
        <button onClick={() => navigate('/login')} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg">Login</button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8 bg-white dark:bg-zinc-900 shadow-sm">
        <h1 className="text-3xl font-extrabold mb-4">Company Dashboard</h1>
        <p className="text-zinc-600 dark:text-zinc-300 mb-6">
          Welcome back, {user.fullName}. Configure your company profile, view applicants, and manage internship requests from students.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link to="/company/admin" className="block p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500 transition">
            <h3 className="text-xl font-bold">Company Admin</h3>
            <p className="text-zinc-500 dark:text-zinc-400 mt-2">Review candidate feed, interview requests, and manage offers.</p>
          </Link>

          <Link to="/profile" className="block p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500 transition">
            <h3 className="text-xl font-bold">Edit Company Profile</h3>
            <p className="text-zinc-500 dark:text-zinc-400 mt-2">Update your organization details, requirements, and recruiting preferences.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
