import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./app.css"; // <-- import your custom CSS file
import { ProfileProvider } from "./hooks/useProfile";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import FloatingAIAssistant from "./components/FloatingAIAssistant";
import Home from "./pages/Home";
import InternshipList from "./pages/InternshipList";
import InternshipDetail from "./pages/InternshipDetail";
import AnnouncementForm from "./pages/AnnouncementForm";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import PostInternship from "./pages/PostInternship";
import AdminDashboard from "./pages/AdminDashboard";
import ApplyUniversityAdmin from "./pages/ApplyUniversityAdmin";
import AdminApplicationsDashboard from "./pages/AdminApplicationsDashboard";
import UniversityDashboard from "./pages/UniversityDashboard";
import MyAnnouncements from "./pages/MyAnnouncements";

export default function App() {
  return (
    <ProfileProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-white dark:bg-zinc-950 transition-colors duration-300">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/internships" element={<InternshipList />} />
              <Route path="/internships/:id" element={<InternshipDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected routes */}
              <Route path="/announce/:id" element={<ProtectedRoute><AnnouncementForm /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/post-internship" element={<ProtectedRoute><PostInternship /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
              <Route path="/apply-university-admin" element={<ProtectedRoute><ApplyUniversityAdmin /></ProtectedRoute>} />
              <Route path="/admin-applications" element={<ProtectedRoute><AdminApplicationsDashboard /></ProtectedRoute>} />
              <Route path="/university-dashboard" element={<ProtectedRoute><UniversityDashboard /></ProtectedRoute>} />
              <Route path="/my-announcements" element={<ProtectedRoute><MyAnnouncements /></ProtectedRoute>} />
            </Routes>
          </main>
          <Footer />
          <FloatingAIAssistant />
        </div>
      </Router>
    </ProfileProvider>
  );
}