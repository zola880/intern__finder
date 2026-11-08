import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Eye, EyeOff } from 'lucide-react';
import api from '../services/api';
import { useProfile } from '../hooks/useProfile';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    university: '',
    department: '',
    role: 'STUDENT'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { setAuth } = useProfile();

  // Top 10 Ethiopian universities
  const ethiopianUniversities = [
    "Addis Ababa University",
    "Adama Science and Technology University",
    "Bahir Dar University",
    "Jimma University",
    "Haramaya University",
    "Mekelle University",
    "University of Gondar",
    "Hawassa University",
    "Dire Dawa University",
    "Arba Minch University"
  ];

  // Common departments (for suggestions)
  const departmentSuggestions = [
    "Computer Science",
    "Software Engineering",
    "Information Technology",
    "Cybersecurity",
    "Information Systems",
    "Electrical Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Business Administration",
    "Economics",
    "Accounting",
    "Marketing",
    "Law",
    "Medicine",
    "Nursing",
    "Pharmacy"
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...submitData } = formData;
      const { data } = await api.post('/auth/register', submitData);
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      setAuth(data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-xl p-8 sm:p-10 transition-colors">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-600/20">
              <UserPlus className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Create Account</h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-2">Join EthioInternAI and start your journey</p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 p-3 rounded-xl mb-6 text-sm">
              {error}
            </div>
          )}
      <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={handleChange}
            required
            className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
          />
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full p-3 pr-11 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className={`w-full p-3 pr-11 bg-zinc-50 dark:bg-zinc-800 border rounded-xl text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${
                formData.confirmPassword && formData.password !== formData.confirmPassword
                  ? 'border-red-400 dark:border-red-500 focus:border-red-500 focus:ring-red-500/50'
                  : formData.confirmPassword && formData.password === formData.confirmPassword
                  ? 'border-green-400 dark:border-green-500 focus:border-green-500 focus:ring-green-500/50'
                  : 'border-zinc-200 dark:border-zinc-700 focus:border-indigo-500'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {formData.confirmPassword && formData.password !== formData.confirmPassword && (
            <p className="text-xs text-red-500 dark:text-red-400 mt-1">Passwords do not match</p>
          )}
          {formData.confirmPassword && formData.password === formData.confirmPassword && formData.password.length >= 6 && (
            <p className="text-xs text-green-500 dark:text-green-400 mt-1">Passwords match ✓</p>
          )}

        {/* Register as Intern or Host Company */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Register as</label>
          <div className="grid grid-cols-2 gap-3">
            <label className={`flex items-center gap-2 p-3 border rounded cursor-pointer ${formData.role === 'STUDENT' ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500' : 'border-zinc-200 dark:border-zinc-700 hover:border-indigo-300'}`}>
              <input
                type="radio"
                name="role"
                value="STUDENT"
                checked={formData.role === 'STUDENT'}
                onChange={handleChange}
                className="w-4 h-4 text-indigo-600"
              />
              <span className="text-sm font-medium">Intern (Student)</span>
            </label>
            <label className={`flex items-center gap-2 p-3 border rounded cursor-pointer ${formData.role === 'EMPLOYER' ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500' : 'border-zinc-200 dark:border-zinc-700 hover:border-indigo-300'}`}>
              <input
                type="radio"
                name="role"
                value="EMPLOYER"
                checked={formData.role === 'EMPLOYER'}
                onChange={handleChange}
                className="w-4 h-4 text-indigo-600"
              />
              <span className="text-sm font-medium">Host Company (Employer)</span>
            </label>
          </div>
        </div>

        {/* University Dropdown (only for interns) */}
        {formData.role === 'STUDENT' && (
          <>
            <select
              name="university"
              value={formData.university}
              onChange={handleChange}
              required
              className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
            >
              <option value="" disabled>Select your university</option>
              {ethiopianUniversities.map((uni) => (
                <option key={uni} value={uni}>{uni}</option>
              ))}
            </select>

            {/* Department Input with Datalist (suggestions + free text) */}
            <input
              list="department-list"
              name="department"
              placeholder="Department (e.g., Computer Science)"
              value={formData.department}
              onChange={handleChange}
              className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
            />
            <datalist id="department-list">
              {departmentSuggestions.map((dept) => (
                <option key={dept} value={dept} />
              ))}
            </datalist>
          </>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <UserPlus className="w-5 h-5" />
              Create Account
            </>
          )}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
        Already have an account?{' '}
        <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
          Sign in
        </Link>
      </p>
    </div>
    </div>
    </div>
  );
};

export default Register;