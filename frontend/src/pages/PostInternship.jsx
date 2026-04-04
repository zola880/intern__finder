import React, { useState } from 'react';// New page for companies to post internships
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Briefcase, MapPin, Calendar, Clock, ExternalLink, CheckCircle2, Building2, Users, Sparkles, Loader2 } from 'lucide-react';
import api from '../services/api';
import { useProfile } from '../hooks/useProfile';

const PostInternship = () => {
  const { user } = useProfile();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    companyName: '',
    location: '',
    field: 'IT',
    shortDescription: '',
    fullDescription: '',
    requiredSkills: '',
    duration: '',
    deadline: '',
    website: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const skillsArray = form.requiredSkills.split(',').map(s => s.trim());
      await api.post('/internships', { ...form, requiredSkills: skillsArray });
      alert('Internship submitted for admin approval.');
      navigate('/internships');
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Briefcase className="w-10 h-10 text-indigo-600" />
        </div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Login Required</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">Please login to post an internship opportunity.</p>
        <button
          onClick={() => navigate('/login')}
          className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-8 py-8 text-white">
          <div className="flex items-center gap-3 mb-2">
            <Briefcase className="w-8 h-8" />
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Post an Internship</h1>
          </div>
          <p className="text-indigo-100 text-sm">
            Share opportunities with Ethiopian students. Your posting will be reviewed by an admin before going live.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 p-4 rounded-2xl text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Company Name
              </label>
              <input
                name="companyName"
                placeholder="e.g., Safaricom Ethiopia"
                value={form.companyName}
                onChange={handleChange}
                required
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl py-3 px-4 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Location
              </label>
              <input
                name="location"
                placeholder="e.g., Addis Ababa"
                value={form.location}
                onChange={handleChange}
                required
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl py-3 px-4 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Field / Category
              </label>
              <select
                name="field"
                value={form.field}
                onChange={handleChange}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl py-3 px-4 text-zinc-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
              >
                <option value="IT">💻 IT & Software</option>
                <option value="Business">📊 Business & Finance</option>
                <option value="Engineering">⚙️ Engineering</option>
                <option value="Health">🏥 Health & Medical</option>
                <option value="Other">📚 Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Duration
              </label>
              <input
                name="duration"
                placeholder="e.g., 3 Months"
                value={form.duration}
                onChange={handleChange}
                required
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl py-3 px-4 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Application Deadline
              </label>
              <input
                type="date"
                name="deadline"
                value={form.deadline}
                onChange={handleChange}
                required
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl py-3 px-4 text-zinc-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                Application URL
              </label>
              <input
                type="url"
                name="website"
                placeholder="https://company.com/careers"
                value={form.website}
                onChange={handleChange}
                required
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl py-3 px-4 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Short Description (visible in cards)
            </label>
            <textarea
              name="shortDescription"
              rows="2"
              placeholder="Brief overview of the internship opportunity..."
              value={form.shortDescription}
              onChange={handleChange}
              required
              className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl py-3 px-4 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Full Description
            </label>
            <textarea
              name="fullDescription"
              rows="5"
              placeholder="Detailed description, responsibilities, requirements, benefits..."
              value={form.fullDescription}
              onChange={handleChange}
              required
              className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl py-3 px-4 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Required Skills (comma separated)
            </label>
            <input
              name="requiredSkills"
              placeholder="e.g., JavaScript, React, Node.js, Problem Solving"
              value={form.requiredSkills}
              onChange={handleChange}
              required
              className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl py-3 px-4 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
            />
          </div>

          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-400 text-white rounded-2xl font-bold text-lg transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Briefcase className="w-5 h-5" />
                  Submit for Review
                </>
              )}
            </button>
            <p className="mt-4 text-xs text-center text-zinc-500 dark:text-zinc-400">
              Your submission will be reviewed by an admin before being published. We'll notify you once approved.
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default PostInternship;