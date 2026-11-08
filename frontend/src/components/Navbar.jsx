import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Briefcase, Menu, X, LogOut, User, Sun, Moon } from "lucide-react";
import { useProfile } from "../hooks/useProfile";
import { useTheme } from "../hooks/useTheme";

const Navbar = () => {
  const { user, logout } = useProfile();
  const { isDark, toggle } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const coreLinks = [
    { name: "Internships", path: "/internships" },
    { name: "How it works", path: "/how-it-works" },
  ];
  if (user) {
    if (user.role === "EMPLOYER") {
      coreLinks.push({ name: "Post Internship", path: "/post-internship" });
      coreLinks.push({ name: "Applicants", path: "/company/applications" });
    }
    if (user.role === "UNIVERSITY_ADMIN") coreLinks.push({ name: "University Dashboard", path: "/university-dashboard" });
    if (user.role === "ADMIN") coreLinks.push({ name: "Admin", path: "/admin" });
  }

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 transition-colors duration-300">
      <div className="px-4 sm:px-6 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-600/20">
            <Briefcase className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-xl text-zinc-900 dark:text-white">
            EthioIntern<span className="text-indigo-600">AI</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {coreLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm font-medium transition-colors ${
                location.pathname === link.path ? "text-indigo-600" : "text-zinc-600 dark:text-zinc-400 hover:text-indigo-600"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Right area */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Dark mode toggle */}
          <button
            onClick={toggle}
            className="p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Toggle dark mode"
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {user ? (
            <>
              <Link to="/profile" className="flex items-center gap-1.5 text-sm text-zinc-600 dark:text-zinc-300 hover:text-indigo-600 transition-colors">
                <User className="w-5 h-5" />
                <span className="hidden sm:inline font-medium">{user.fullName?.split(" ")[0]}</span>
              </Link>
              <button onClick={handleLogout} className="p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors" aria-label="Logout">
                <LogOut className="w-5 h-5" />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-md shadow-indigo-600/20 hover:shadow-lg hover:shadow-indigo-600/30 transition-all"
              >
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 w-10 h-10 flex items-center justify-center transition-colors"
            aria-label="Menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 px-4 py-4 space-y-3">
          {coreLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className="block py-3 text-base text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 transition-colors"
            >
              {link.name}
            </Link>
          ))}
          {!user && (
            <div className="flex flex-col gap-2 pt-2">
              <Link to="/login" onClick={() => setIsOpen(false)} className="text-center px-4 py-3 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg font-semibold hover:border-indigo-600 hover:text-indigo-600 transition-all">Sign In</Link>
              <Link to="/register" onClick={() => setIsOpen(false)} className="text-center px-4 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-all">Get Started</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;