import React, { useState } from 'react';// New login page
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useProfile } from '../hooks/useProfile';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setAuth } = useProfile(); // we'll add this to context

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      setAuth(data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-24">
      <h1 className="text-3xl font-bold mb-8">Login</h1>
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full p-3 border rounded" />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full p-3 border rounded" />
        <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded font-bold">Login</button>
      </form>
      <p className="mt-4 text-center">Don't have an account? <Link to="/register" className="text-indigo-600">Register</Link></p>
    </div>
  );
};

export default Login;