import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import {
  Briefcase,
  Sparkles,
  ArrowRight,
  Calendar,
  MapPin,
  Building2,
  Zap,
  Search,
  Send,
  MessageCircle,
  Globe,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  ChevronRight,
  Shield,
  TrendingUp,
  Users,
} from "lucide-react";

// ---------- Helper: Format Date ----------
const formatDate = (dateString) => {
  if (!dateString) return "No deadline";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// ---------- Skeleton Card for Loading ----------
const SkeletonCard = () => (
  <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 dark:border-zinc-800 p-5 animate-pulse">
    <div className="flex items-start justify-between">
      <div className="w-12 h-12 bg-zinc-200 dark:bg-zinc-800 rounded-xl"></div>
      <div className="w-16 h-6 bg-zinc-200 dark:bg-zinc-800 rounded-full"></div>
    </div>
    <div className="mt-4 space-y-2">
      <div className="h-5 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4"></div>
      <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2"></div>
      <div className="flex gap-3 mt-3">
        <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-24"></div>
        <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-24"></div>
      </div>
    </div>
  </div>
);

// ---------- Modern Glassmorphism Internship Card ----------
const ModernInternshipCard = ({ internship }) => {
  const company = internship.company || internship.employer || "Company";
  const title = internship.title || internship.position || "Internship";
  const location = internship.location || "Ethiopia";
  const status = internship.status || "Open";
  const deadline = internship.deadline || internship.applicationDeadline;
  const id = internship._id || internship.id;
  const isOpen = status.toLowerCase() === "open";

  return (
    <div className="group relative bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-white/30 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-800/60 flex flex-col overflow-hidden">
      {/* Gradient hover effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-indigo-500/5 group-hover:via-purple-500/5 group-hover:to-pink-500/5 transition-all duration-500 pointer-events-none"></div>
      
      <div className="p-5 flex-1 relative z-10">
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md">
            <Building2 size={22} />
          </div>
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
              isOpen
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 border border-red-200 dark:border-red-800"
            }`}
          >
            {status}
          </span>
        </div>

        <h3 className="text-xl font-bold mt-4 line-clamp-1 text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {title}
        </h3>

        <div className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400 text-sm mt-1">
          <Building2 size={14} />
          <span className="line-clamp-1">{company}</span>
        </div>

        <div className="flex flex-wrap gap-3 mt-4 text-sm text-zinc-600 dark:text-zinc-300">
          <div className="flex items-center gap-1">
            <MapPin size={14} className="text-zinc-400" />
            <span>{location}</span>
          </div>
          {deadline && (
            <div className="flex items-center gap-1">
              <Calendar size={14} className="text-zinc-400" />
              <span>Due: {formatDate(deadline)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="px-5 pb-5 pt-0 mt-auto relative z-10">
        <Link
          to={`/internships/${id}`}
          className="inline-flex items-center justify-center w-full gap-2 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-medium hover:bg-gradient-to-r hover:from-indigo-500 hover:to-indigo-600 hover:text-white transition-all duration-300 group"
        >
          View Details
          <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
};

const Home = () => {
  const [featuredInternships, setFeaturedInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data } = await api.get("/internships?limit=3&status=Open");
        // Ensure we always have an array
        setFeaturedInternships(data.data || []);
      } catch (err) {
        console.error("Failed to fetch featured internships:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-indigo-950/30 overflow-x-hidden">
      
      {/* ---------- HERO SECTION with animated gradient and floating elements ---------- */}
      <section className="relative px-6 pt-20 pb-16 sm:pt-28 sm:pb-24 md:pt-32 lg:pt-40 overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-gradient-to-r from-indigo-400/30 to-purple-400/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-gradient-to-r from-pink-400/20 to-rose-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/3 right-1/3 w-60 h-60 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 rounded-full blur-2xl animate-pulse delay-500"></div>
        </div>

        <div className="max-w-6xl mx-auto text-center relative z-10">
          {/* Floating badge */}
          <div className="inline-flex items-center gap-2 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md shadow-sm border border-white/40 dark:border-zinc-800 text-indigo-700 dark:text-indigo-300 px-4 py-1.5 rounded-full text-sm font-medium mb-6 animate-float">
            <Sparkles size={16} className="text-indigo-500" />
            <span>AI-Powered Career Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-tight">
            Find Internships{" "}
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient">
              in Ethiopia
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-zinc-600 dark:text-zinc-300 max-w-2xl mx-auto mt-6 leading-relaxed">
            Discover verified internship opportunities and grow your career with
            confidence — powered by smart AI guidance.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8 sm:mt-10">
            <Link
              to="/internships"
              className="group inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-full font-semibold shadow-lg shadow-indigo-500/30 transition-all duration-300 hover:scale-105"
            >
              Browse Internships
              <ArrowRight size={18} className="group-hover:translate-x-1 transition" />
            </Link>
            <Link
              to="/ai-assistant"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border border-zinc-300 dark:border-zinc-700 rounded-full font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-white dark:hover:bg-zinc-800/90 transition-all duration-300 hover:shadow-md"
            >
              <MessageCircle size={18} />
              AI Assistant
            </Link>
          </div>

          {/* Trust indicators with icons */}
          <div className="flex flex-wrap justify-center gap-6 mt-12 text-sm text-zinc-600 dark:text-zinc-400">
            <div className="flex items-center gap-2 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <Shield size={16} className="text-indigo-500" />
              <span>Verified Opportunities</span>
            </div>
            <div className="flex items-center gap-2 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <TrendingUp size={16} className="text-purple-500" />
              <span>AI Career Coach</span>
            </div>
            <div className="flex items-center gap-2 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <Users size={16} className="text-pink-500" />
              <span>Top Ethiopian Companies</span>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- HOW IT WORKS (interactive card steps) ---------- */}
      <section className="px-6 py-20 sm:py-28 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1 rounded-full inline-block">
            Simple Process
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold mt-3">
            How it works
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 mt-4">
            Three easy steps to launch your career journey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: Search,
              title: "1. Browse",
              desc: "Explore available internships across different fields with smart filters.",
              gradient: "from-indigo-500 to-indigo-600",
            },
            {
              icon: Send,
              title: "2. Apply",
              desc: "Submit your application quickly and easily with one-click apply.",
              gradient: "from-purple-500 to-purple-600",
            },
            {
              icon: Zap,
              title: "3. Get Guidance",
              desc: "Use AI tools to improve your chances of success and ace interviews.",
              gradient: "from-pink-500 to-pink-600",
            },
          ].map((step, idx) => (
            <div
              key={idx}
              className="group relative bg-white/80 dark:bg-zinc-900/60 backdrop-blur-sm rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-white/30 dark:border-zinc-800 hover:border-indigo-200 dark:hover:border-indigo-800/40 transform hover:-translate-y-1"
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.gradient} text-white flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <step.icon size={28} />
              </div>
              <h3 className="text-xl font-bold mb-2">{step.title}</h3>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- FEATURED INTERNSHIPS SECTION ---------- */}
      <section className="px-6 py-12 sm:py-20 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <span className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1 rounded-full inline-block">
              Top Picks
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-2">
              Featured Internships
            </h2>
          </div>
          <Link
            to="/internships"
            className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-medium hover:gap-2 transition-all group"
          >
            View all
            <ArrowRight size={16} className="group-hover:translate-x-1 transition" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16 bg-white/50 dark:bg-zinc-900/50 rounded-2xl backdrop-blur-sm">
            <p className="text-red-600 dark:text-red-400 font-medium">
              Failed to load internships. Please try again later.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-full text-sm hover:bg-indigo-700 transition"
            >
              Retry
            </button>
          </div>
        ) : featuredInternships.length === 0 ? (
          <div className="text-center py-16 bg-white/50 dark:bg-zinc-900/50 rounded-2xl backdrop-blur-sm">
            <p className="text-zinc-600 dark:text-zinc-400">
              No internships available at the moment. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredInternships.map((internship) => (
              <ModernInternshipCard key={internship._id} internship={internship} />
            ))}
          </div>
        )}
      </section>

      {/* ---------- CTA SECTION with gradient and pattern ---------- */}
      <section className="mx-6 my-16 sm:my-24">
        <div className="max-w-5xl mx-auto bg-gradient-to-br from-indigo-600 via-purple-700 to-pink-700 rounded-3xl p-8 sm:p-12 text-center shadow-2xl relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-white rounded-full blur-3xl"></div>
          </div>
          <div className="relative z-10">
            <h2 className="text-2xl sm:text-4xl font-bold text-white mb-3">
              Start your career journey today
            </h2>
            <p className="text-indigo-100 text-base sm:text-lg max-w-xl mx-auto mb-8">
              Join thousands of Ethiopian students finding real opportunities across the country.
            </p>
            <Link
              to="/internships"
              className="inline-flex items-center gap-2 bg-white text-indigo-700 px-8 py-3.5 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105 group"
            >
              Get Started
              <ArrowRight size={18} className="group-hover:translate-x-1 transition" />
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- FOOTER (modern with gradient accents) ---------- */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 mt-12 pt-12 pb-8 px-6 bg-white/50 dark:bg-zinc-900/30 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Brand Column */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                  <Briefcase size={16} className="text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  EthioInternAI
                </span>
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Connecting Ethiopian students with top internships and AI-driven career guidance.
              </p>
              <div className="flex gap-4 mt-5">
                <a href="#" className="text-zinc-400 hover:text-indigo-600 transition transform hover:scale-110"><Twitter size={18} /></a>
                <a href="#" className="text-zinc-400 hover:text-indigo-600 transition transform hover:scale-110"><Linkedin size={18} /></a>
                <a href="#" className="text-zinc-400 hover:text-indigo-600 transition transform hover:scale-110"><Facebook size={18} /></a>
                <a href="#" className="text-zinc-400 hover:text-indigo-600 transition transform hover:scale-110"><Instagram size={18} /></a>
              </div>
            </div>

            {/* Platform Links */}
            <div>
              <h4 className="font-semibold text-lg mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                <li><Link to="/internships" className="hover:text-indigo-600 transition flex items-center gap-1"><ChevronRight size={14} /> Browse Internships</Link></li>
                <li><Link to="/ai-assistant" className="hover:text-indigo-600 transition flex items-center gap-1"><ChevronRight size={14} /> AI Career Guide</Link></li>
                <li><Link to="/profile" className="hover:text-indigo-600 transition flex items-center gap-1"><ChevronRight size={14} /> Student Profile</Link></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-semibold text-lg mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                <li><a href="#" className="hover:text-indigo-600 transition flex items-center gap-1"><ChevronRight size={14} /> Career Tips</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition flex items-center gap-1"><ChevronRight size={14} /> Interview Prep</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition flex items-center gap-1"><ChevronRight size={14} /> CV Builder</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold text-lg mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                <li className="flex items-center gap-2"><Globe size={14} className="text-indigo-500" /> support@ethiointern.ai</li>
                <li className="flex items-center gap-2"><MapPin size={14} className="text-indigo-500" /> Addis Ababa, Ethiopia</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-zinc-200 dark:border-zinc-800 mt-10 pt-6 text-center text-xs text-zinc-500 dark:text-zinc-500">
            © {new Date().getFullYear()} EthioInternAI. All rights reserved. Empowering Ethiopian youth.
          </div>
        </div>
      </footer>

      {/* Custom keyframes for animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 3s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Home;