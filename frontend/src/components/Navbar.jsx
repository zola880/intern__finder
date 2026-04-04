import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Briefcase, Menu, X, LogOut, User, ChevronDown, Shield } from "lucide-react";
import { useProfile } from "../hooks/useProfile";

const Navbar = () => {
  const { user, logout } = useProfile();
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Add shadow on scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Navigation links
  const coreLinks = [{ name: "Internships", path: "/internships", icon: Briefcase }];
  if (user) {
    if (user.role === "UNIVERSITY_ADMIN") coreLinks.push({ name: "University Dashboard", path: "/university-dashboard", icon: Shield });
    if (user.role === "ADMIN") coreLinks.push({ name: "Admin", path: "/admin", icon: Shield });
  }

  const handleLogout = () => {
    logout();
    navigate("/login");
    setIsDropdownOpen(false);
  };

  // Get user initials
  const getInitials = () => {
    if (!user?.fullName) return "U";
    return user.fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/95 dark:bg-zinc-950/95 shadow-lg backdrop-blur-md" : "bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm"} border-b border-zinc-200 dark:border-zinc-800`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-18">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-indigo-500 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
              <Briefcase className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-zinc-900 to-zinc-700 dark:from-white dark:to-zinc-300 bg-clip-text text-transparent">
              EthioIntern<span className="text-indigo-600 bg-none">AI</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {coreLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                  location.pathname === link.path
                    ? "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 hover:bg-zinc-100 dark:hover:bg-zinc-800/50"
                }`}
              >
                <link.icon className="w-4 h-4" />
                {link.name}
                {location.pathname === link.path && (
                  <motion.span
                    layoutId="activeNav"
                    className="absolute bottom-0 left-2 right-2 h-0.5 bg-indigo-600 rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Right side – user area */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-200 group"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-md group-hover:scale-105 transition-transform">
                    {getInitials()}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-zinc-900 dark:text-white leading-tight">
                      {user.fullName?.split(" ")[0]}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-tight">
                      {user.role === "ADMIN" ? "Admin" : user.role === "UNIVERSITY_ADMIN" ? "Univ. Admin" : "Student"}
                    </p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden z-50 animate-fadeInUp">
                    <div className="p-3 border-b border-zinc-100 dark:border-zinc-800">
                      <p className="text-sm font-semibold text-zinc-900 dark:text-white">{user.fullName}</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{user.email}</p>
                    </div>
                    <div className="py-2">
                      <Link
                        to="/profile"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <User className="w-4 h-4" />
                        Your Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl border border-indigo-600 text-indigo-600 text-sm font-semibold transition-all hover:bg-indigo-50 dark:hover:bg-indigo-950/30 hover:scale-105"
                >
                  Register
                </Link>
                <Link
                  to="/login"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-all shadow-md hover:shadow-lg hover:scale-105"
                >
                  Login
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
              aria-label="Menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <div
        className={`md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setIsOpen(false)}
      />
      <div
        className={`md:hidden fixed top-0 right-0 h-full w-72 bg-white dark:bg-zinc-950 shadow-2xl z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-end p-4">
          <button onClick={() => setIsOpen(false)} className="p-2 rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="px-6 py-4 space-y-3">
          {coreLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <link.icon className="w-5 h-5" />
              {link.name}
            </Link>
          ))}
          {!user && (
            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
              <Link
                to="/register"
                onClick={() => setIsOpen(false)}
                className="block text-center px-4 py-3 rounded-xl border border-indigo-600 text-indigo-600 font-semibold"
              >
                Register
              </Link>
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="block text-center px-4 py-3 rounded-xl bg-indigo-600 text-white font-semibold"
              >
                Login
              </Link>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.2s ease-out;
        }
      `}</style>
    </nav>
  );
};

export default Navbar;