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
  Search,
  MessageCircle,
  Globe,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  ChevronRight,
  Shield,
  CheckCircle,
  Users,
  Target,
  TrendingUp,
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
  <div 
    className="rounded-2xl p-5 animate-pulse"
    style={{ 
      background: '#FFF8F2',
      border: '1px solid #D8B8A0'
    }}
  >
    <div className="flex items-start justify-between">
      <div className="w-12 h-12 rounded-xl" style={{ background: '#D8B8A0' }}></div>
      <div className="w-16 h-6 rounded-full" style={{ background: '#D8B8A0' }}></div>
    </div>
    <div className="mt-4 space-y-2">
      <div className="h-5 rounded w-3/4" style={{ background: '#D8B8A0' }}></div>
      <div className="h-4 rounded w-1/2" style={{ background: '#D8B8A0' }}></div>
      <div className="flex gap-3 mt-3">
        <div className="h-4 rounded w-24" style={{ background: '#D8B8A0' }}></div>
        <div className="h-4 rounded w-24" style={{ background: '#D8B8A0' }}></div>
      </div>
    </div>
  </div>
);

// ---------- Modern Internship Card (Brown Theme) ----------
const InternshipCard = ({ internship }) => {
  const company = internship.company || internship.employer || "Company";
  const title = internship.title || internship.position || "Internship";
  const location = internship.location || "Ethiopia";
  const status = internship.status || "Open";
  const deadline = internship.deadline || internship.applicationDeadline;
  const id = internship._id || internship.id;
  const isOpen = status.toLowerCase() === "open";

  return (
    <div 
      className="group rounded-2xl p-5 transition-all duration-300 hover:shadow-lg flex flex-col h-full"
      style={{ 
        background: '#FFF8F2',
        border: '1px solid #D8B8A0',
        boxShadow: '0 2px 8px rgba(58, 45, 40, 0.08)'
      }}
    >
      <div className="flex items-start justify-between">
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm"
          style={{ background: 'linear-gradient(135deg, #C96C4A, #A55436)' }}
        >
          <Building2 size={20} />
        </div>
        <span
          className={`text-xs font-semibold px-3 py-1 rounded-full border ${
            isOpen
              ? 'text-emerald-800 border-emerald-200'
              : 'text-red-800 border-red-200'
          }`}
          style={isOpen ? { background: '#ECFDF5' } : { background: '#FEF2F2' }}
        >
          {status}
        </span>
      </div>

      <h3 
        className="text-lg font-bold mt-4 line-clamp-1 group-hover:opacity-90 transition-opacity"
        style={{ color: '#3A2D28' }}
      >
        {title}
      </h3>

      <div className="flex items-center gap-1 text-sm mt-1 opacity-80" style={{ color: '#3A2D28' }}>
        <Building2 size={14} />
        <span className="line-clamp-1">{company}</span>
      </div>

      <div className="flex flex-wrap gap-3 mt-4 text-sm opacity-90" style={{ color: '#3A2D28' }}>
        <div className="flex items-center gap-1">
          <MapPin size={14} />
          <span>{location}</span>
        </div>
        {deadline && (
          <div className="flex items-center gap-1">
            <Calendar size={14} />
            <span>Due: {formatDate(deadline)}</span>
          </div>
        )}
      </div>

      <div className="mt-auto pt-4">
        <Link
          to={`/internships/${id}`}
          className="inline-flex items-center justify-center w-full gap-2 py-2.5 rounded-xl font-medium transition-all duration-200"
          style={{ 
            background: '#C96C4A',
            color: 'white',
            boxShadow: '0 2px 4px rgba(201, 108, 74, 0.3)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#A55436'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#C96C4A'}
        >
          View Details
          <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
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
        const { data } = await api.get("/internships?limit=6&status=Open");
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

  // Custom styles for the brown theme
  const theme = {
    bg: '#F5E6DA',
    accent: '#C96C4A',
    accentDark: '#A55436',
    text: '#3A2D28',
    textLight: '#5C4A42',
    secondary: '#D8B8A0',
    card: '#FFF8F2',
    white: '#FFFFFF',
  };

  return (
    <div 
      className="min-h-screen"
      style={{ background: theme.bg, color: theme.text }}
    >
      
      {/* ---------- NAVIGATION ---------- */}
      <nav 
        className="sticky top-0 z-50 px-4 py-3 md:px-6 md:py-4"
        style={{ 
          background: theme.white,
          borderBottom: `1px solid ${theme.secondary}`,
          boxShadow: '0 1px 4px rgba(58, 45, 40, 0.06)'
        }}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <div 
              className="w-9 h-9 rounded-lg flex items-center justify-center shadow-sm"
              style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentDark})` }}
            >
              <Briefcase size={18} color="white" />
            </div>
            <span className="text-xl font-bold" style={{ color: theme.text }}>
              EthioIntern<span style={{ color: theme.accent }}>AI</span>
            </span>
          </Link>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/internships" className="font-medium hover:opacity-80 transition-opacity">Internships</Link>
            <Link to="/ai-assistant" className="font-medium hover:opacity-80 transition-opacity">AI Tools</Link>
            <Link to="/companies" className="font-medium hover:opacity-80 transition-opacity">Companies</Link>
            <Link to="/about" className="font-medium hover:opacity-80 transition-opacity">About</Link>
          </div>
          
          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            <Link 
              to="/login" 
              className="hidden sm:inline-flex px-4 py-2 font-medium hover:opacity-80 transition-opacity"
            >
              Sign In
            </Link>
            <Link 
              to="/signup" 
              className="px-5 py-2.5 rounded-xl font-semibold text-white transition-all"
              style={{ 
                background: theme.accent,
                boxShadow: `0 2px 6px rgba(201, 108, 74, 0.25)`
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = theme.accentDark}
              onMouseLeave={(e) => e.currentTarget.style.background = theme.accent}
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ---------- HERO SECTION ---------- */}
      <section className="px-4 py-12 md:px-6 md:py-20 lg:py-28">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 items-center">
          {/* Hero Content */}
          <div>
            <div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6"
              style={{ 
                background: theme.card,
                border: `1px solid ${theme.secondary}`,
                color: theme.accent
              }}
            >
              <Sparkles size={14} />
              <span>AI-Powered Internship Platform</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
              Find Your Dream Internship{" "}
              <span style={{ color: theme.accent }}>in Ethiopia</span>
            </h1>

            <p 
              className="mt-5 text-lg leading-relaxed max-w-xl"
              style={{ color: theme.textLight }}
            >
              Discover verified opportunities, get AI career guidance, and build your professional future — all in one trusted platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Link
                to="/internships"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-white transition-all"
                style={{ 
                  background: theme.accent,
                  boxShadow: `0 4px 12px rgba(201, 108, 74, 0.3)`
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = theme.accentDark;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = theme.accent;
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Browse Internships
                <ArrowRight size={18} />
              </Link>
              <Link
                to="/ai-assistant"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold transition-all border-2"
                style={{ 
                  borderColor: theme.secondary,
                  color: theme.text,
                  background: theme.white
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = theme.card;
                  e.currentTarget.style.borderColor = theme.accent;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = theme.white;
                  e.currentTarget.style.borderColor = theme.secondary;
                }}
              >
                <MessageCircle size={18} />
                Try AI Assistant
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-5 mt-10 pt-6" style={{ borderTop: `1px solid ${theme.secondary}` }}>
              <div className="flex items-center gap-2">
                <Shield size={18} style={{ color: theme.accent }} />
                <span className="text-sm font-medium">Verified Listings</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={18} style={{ color: theme.accent }} />
                <span className="text-sm font-medium">Free for Students</span>
              </div>
              <div className="flex items-center gap-2">
                <Users size={18} style={{ color: theme.accent }} />
                <span className="text-sm font-medium">2,000+ Students</span>
              </div>
            </div>
          </div>

          {/* Hero Visual - Clean Dashboard Preview */}
          <div 
            className="rounded-3xl p-6 shadow-xl"
            style={{ 
              background: theme.white,
              border: `1px solid ${theme.secondary}`,
              boxShadow: '0 12px 40px rgba(58, 45, 40, 0.12)'
            }}
          >
            <div className="space-y-4">
              {/* Match Card */}
              <div 
                className="rounded-2xl p-4"
                style={{ background: theme.card, border: `1px solid ${theme.secondary}` }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span 
                        className="px-2 py-0.5 rounded-full text-xs font-semibold"
                        style={{ background: '#ECFDF5', color: '#065F46' }}
                      >
                        96% Match
                      </span>
                    </div>
                    <h3 className="font-bold" style={{ color: theme.text }}>Frontend Developer Intern</h3>
                    <p className="text-sm opacity-80">TechEthio • Addis Ababa</p>
                  </div>
                  <Briefcase size={22} style={{ color: theme.accent }} />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-medium" style={{ background: theme.white, border: `1px solid ${theme.secondary}` }}>React</span>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-medium" style={{ background: theme.white, border: `1px solid ${theme.secondary}` }}>Paid</span>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-medium" style={{ background: theme.white, border: `1px solid ${theme.secondary}` }}>Remote</span>
                </div>
              </div>

              {/* CV Score */}
              <div 
                className="rounded-2xl p-4"
                style={{ background: theme.card, border: `1px solid ${theme.secondary}` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium opacity-80">CV Strength</span>
                  <span className="font-bold" style={{ color: theme.accent }}>92/100</span>
                </div>
                <div className="w-full rounded-full h-2" style={{ background: theme.secondary }}>
                  <div 
                    className="h-2 rounded-full"
                    style={{ width: '92%', background: theme.accent }}
                  />
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-3">
                <button 
                  className="py-3 rounded-xl font-medium text-white transition-all"
                  style={{ background: theme.accent }}
                >
                  Improve CV
                </button>
                <button 
                  className="py-3 rounded-xl font-medium transition-all border"
                  style={{ 
                    borderColor: theme.secondary, 
                    background: theme.white,
                    color: theme.text
                  }}
                >
                  Practice Interview
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- STATS SECTION ---------- */}
      <section 
        className="px-4 py-10 md:py-14"
        style={{ background: theme.white, borderTop: `1px solid ${theme.secondary}`, borderBottom: `1px solid ${theme.secondary}` }}
      >
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: "500+", label: "Internships", icon: Briefcase },
            { value: "120+", label: "Companies", icon: Building2 },
            { value: "2K+", label: "Students", icon: Users },
            { value: "85%", label: "Success Rate", icon: TrendingUp },
          ].map((stat, i) => (
            <div key={i} className="text-center p-4">
              <div 
                className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-3"
                style={{ background: theme.card, border: `1px solid ${theme.secondary}` }}
              >
                <stat.icon size={22} style={{ color: theme.accent }} />
              </div>
              <div className="text-2xl md:text-3xl font-bold" style={{ color: theme.text }}>{stat.value}</div>
              <div className="text-sm opacity-80">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- HOW IT WORKS ---------- */}
      <section className="px-4 py-16 md:py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">How It Works</h2>
            <p style={{ color: theme.textLight }}>Three simple steps to launch your career</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Search,
                title: "Browse Opportunities",
                desc: "Filter internships by field, location, and requirements.",
              },
              {
                icon: Target,
                title: "Apply with Confidence",
                desc: "Submit applications with AI-optimized CVs and cover letters.",
              },
              {
                icon: Sparkles,
                title: "Get Career Guidance",
                desc: "Receive personalized tips and interview preparation.",
              },
            ].map((step, idx) => (
              <div 
                key={idx} 
                className="rounded-2xl p-6 text-center transition-all hover:shadow-md"
                style={{ 
                  background: theme.card,
                  border: `1px solid ${theme.secondary}`
                }}
              >
                <div 
                  className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentDark})` }}
                >
                  <step.icon size={26} color="white" />
                </div>
                <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                <p className="text-sm opacity-80">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- FEATURED INTERNSHIPS ---------- */}
      <section className="px-4 py-12 md:py-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">Featured Internships</h2>
              <p className="opacity-80 mt-1">Hand-picked opportunities for you</p>
            </div>
            <Link
              to="/internships"
              className="inline-flex items-center gap-1 font-medium transition-opacity hover:opacity-80"
              style={{ color: theme.accent }}
            >
              View all <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : error ? (
            <div 
              className="text-center py-12 rounded-2xl"
              style={{ background: theme.card, border: `1px solid ${theme.secondary}` }}
            >
              <p className="font-medium" style={{ color: '#B91C1C' }}>
                Failed to load internships. Please try again.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-6 py-2 rounded-xl text-white text-sm font-medium"
                style={{ background: theme.accent }}
              >
                Retry
              </button>
            </div>
          ) : featuredInternships.length === 0 ? (
            <div 
              className="text-center py-12 rounded-2xl"
              style={{ background: theme.card, border: `1px solid ${theme.secondary}` }}
            >
              <p className="opacity-80">No internships available right now. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {featuredInternships.map((internship) => (
                <InternshipCard key={internship._id} internship={internship} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ---------- CTA SECTION ---------- */}
      <section className="px-4 py-12 md:py-16">
        <div 
          className="max-w-4xl mx-auto rounded-3xl p-8 md:p-12 text-center"
          style={{ 
            background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentDark})`,
            color: 'white'
          }}
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Ready to Start Your Career Journey?
          </h2>
          <p className="opacity-90 mb-8 max-w-lg mx-auto">
            Join thousands of Ethiopian students finding meaningful internships with EthioInternAI.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold bg-white transition-all"
            style={{ color: theme.accent }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Create Free Account
            <ArrowRight size={18} />
          </Link>
          <p className="text-sm opacity-80 mt-5">✓ No credit card required &nbsp; ✓ Cancel anytime</p>
        </div>
      </section>

      {/* ---------- FOOTER ---------- */}
      <footer 
        className="px-4 py-12 md:py-16 mt-8"
        style={{ 
          background: theme.white,
          borderTop: `1px solid ${theme.secondary}`
        }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentDark})` }}
                >
                  <Briefcase size={16} color="white" />
                </div>
                <span className="text-lg font-bold" style={{ color: theme.text }}>
                  EthioIntern<span style={{ color: theme.accent }}>AI</span>
                </span>
              </div>
              <p className="text-sm opacity-80 leading-relaxed">
                Connecting Ethiopian students with top internships and AI-driven career guidance.
              </p>
              <div className="flex gap-4 mt-5">
                {[Twitter, Linkedin, Facebook, Instagram].map((Icon, i) => (
                  <a 
                    key={i} 
                    href="#" 
                    className="opacity-70 hover:opacity-100 transition-opacity"
                    style={{ color: theme.text }}
                  >
                    <Icon size={18} />
                  </a>
                ))}
              </div>
            </div>

            {/* Platform */}
            <div>
              <h4 className="font-semibold mb-4" style={{ color: theme.text }}>Platform</h4>
              <ul className="space-y-2 text-sm opacity-80">
                <li><Link to="/internships" className="hover:opacity-100 transition-opacity flex items-center gap-1"><ChevronRight size={14} /> Browse Internships</Link></li>
                <li><Link to="/ai-assistant" className="hover:opacity-100 transition-opacity flex items-center gap-1"><ChevronRight size={14} /> AI Career Tools</Link></li>
                <li><Link to="/profile" className="hover:opacity-100 transition-opacity flex items-center gap-1"><ChevronRight size={14} /> My Profile</Link></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-semibold mb-4" style={{ color: theme.text }}>Resources</h4>
              <ul className="space-y-2 text-sm opacity-80">
                <li><a href="#" className="hover:opacity-100 transition-opacity flex items-center gap-1"><ChevronRight size={14} /> Career Guides</a></li>
                <li><a href="#" className="hover:opacity-100 transition-opacity flex items-center gap-1"><ChevronRight size={14} /> Interview Tips</a></li>
                <li><a href="#" className="hover:opacity-100 transition-opacity flex items-center gap-1"><ChevronRight size={14} /> CV Templates</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold mb-4" style={{ color: theme.text }}>Contact</h4>
              <ul className="space-y-3 text-sm opacity-80">
                <li className="flex items-center gap-2">
                  <Globe size={14} style={{ color: theme.accent }} />
                  <span>support@ethiointern.ai</span>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin size={14} style={{ color: theme.accent }} />
                  <span>Addis Ababa, Ethiopia</span>
                </li>
              </ul>
            </div>
          </div>

          <div 
            className="border-t pt-6 mt-10 text-center text-sm opacity-70"
            style={{ borderColor: theme.secondary }}
          >
            © {new Date().getFullYear()} EthioInternAI. All rights reserved. Empowering Ethiopian youth.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;