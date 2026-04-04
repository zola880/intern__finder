import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Twitter, Linkedin, Github, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 py-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo & description */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <span className="font-bold text-xl tracking-tight text-zinc-900 dark:text-white">
                EthioIntern<span className="text-indigo-600">AI</span>
              </span>
            </Link>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
              Connecting Ethiopian students with top internships and AI-driven career guidance.
            </p>
            <div className="flex gap-3 mt-4">
              {[Facebook, Twitter, Linkedin, Github].map((Icon, i) => (
                <a key={i} href="#" className="p-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 transition-all">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-semibold text-zinc-900 dark:text-white mb-4">Platform</h4>
            <ul className="space-y-2 text-zinc-600 dark:text-zinc-400 text-sm">
              <li><Link to="/internships" className="hover:text-indigo-600">Browse Internships</Link></li>
              <li><Link to="/ai-assistant" className="hover:text-indigo-600">AI Career Guide</Link></li>
              <li><Link to="/profile" className="hover:text-indigo-600">Student Profile</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-zinc-900 dark:text-white mb-4">Contact</h4>
            <ul className="space-y-2 text-zinc-600 dark:text-zinc-400 text-sm">
              <li className="flex items-center gap-2"><Mail className="w-4 h-4" /> support@ethiointern.ai</li>
              <li>Addis Ababa, Ethiopia</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-zinc-500 dark:text-zinc-500">
          <p>© 2026 EthioIntern AI. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="#" className="hover:text-zinc-900 dark:hover:text-white">Privacy</Link>
            <Link to="#" className="hover:text-zinc-900 dark:hover:text-white">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;