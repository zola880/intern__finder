import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Briefcase, Menu, X, LogOut, User } from "lucide-react";
import { useProfile } from "../hooks/useProfile";

const Navbar = () => {
  const { user, logout } = useProfile();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const coreLinks = [{ name: "Internships", path: "/internships" }];
  if (user) {
    if (user.role === "UNIVERSITY_ADMIN") coreLinks.push({ name: "University Dashboard", path: "/university-dashboard" });
    if (user.role === "ADMIN") coreLinks.push({ name: "Admin", path: "/admin" });
  }

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
      <div className="px-4 sm:px-6 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center">
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
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link to="/profile" className="flex items-center gap-1 text-sm text-zinc-600 dark:text-zinc-300 hover:text-indigo-600">
                <User className="w-5 h-5" />
                <span className="hidden sm:inline">{user.fullName?.split(" ")[0]}</span>
              </Link>
              <button onClick={handleLogout} className="p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100">
                <LogOut className="w-5 h-5" />
              </button>
            </>
          ) : (
            <div className="flex gap-2">
              <Link to="/register" className="px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg text-sm font-semibold">Register</Link>
              <Link to="/login" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold">Login</Link>
            </div>
          )}

          {/* Mobile menu button – larger tap area */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 w-10 h-10 flex items-center justify-center"
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
              className="block py-3 text-base text-zinc-600 dark:text-zinc-400 hover:text-indigo-600"
            >
              {link.name}
            </Link>
          ))}
          {!user && (
            <div className="flex gap-3 pt-2">
              <Link to="/register" className="flex-1 text-center px-4 py-3 border border-indigo-600 text-indigo-600 rounded-lg font-semibold">Register</Link>
              <Link to="/login" className="flex-1 text-center px-4 py-3 bg-indigo-600 text-white rounded-lg font-semibold">Login</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;