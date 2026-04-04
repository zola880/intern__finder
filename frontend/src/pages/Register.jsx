import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useProfile } from '../hooks/useProfile';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    university: '',
    department: '',
    role: 'STUDENT'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/register', formData);
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
    <div className="max-w-md mx-auto px-4 py-24">
      <h1 className="text-3xl font-bold mb-8">Create Account</h1>
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="fullName"
          placeholder="Full Name"
          value={formData.fullName}
          onChange={handleChange}
          required
          className="w-full p-3 border rounded dark:bg-zinc-800 dark:border-zinc-700"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full p-3 border rounded dark:bg-zinc-800 dark:border-zinc-700"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          className="w-full p-3 border rounded dark:bg-zinc-800 dark:border-zinc-700"
        />
        
        {/* University Dropdown */}
        <select
          name="university"
          value={formData.university}
          onChange={handleChange}
          required
          className="w-full p-3 border rounded bg-white dark:bg-zinc-800 dark:border-zinc-700"
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
          className="w-full p-3 border rounded dark:bg-zinc-800 dark:border-zinc-700"
        />
        <datalist id="department-list">
          {departmentSuggestions.map((dept) => (
            <option key={dept} value={dept} />
          ))}
        </datalist>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-3 rounded font-bold disabled:opacity-50"
        >
          {loading ? 'Creating account...' : 'Register'}
        </button>
      </form>
      <p className="mt-4 text-center">
        Already have an account? <Link to="/login" className="text-indigo-600">Login</Link>
      </p>
    </div>
  );
};

export default Register;