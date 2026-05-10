// src/pages/Home.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

/* ─────────────────────────────────────────────
   DESIGN SYSTEM - CSS Variables
───────────────────────────────────────────── */
const styles = `
  :root {
    --primary: #2563EB;
    --primary-dark: #1D4ED8;
    --accent: #F59E0B;
    --accent-dark: #D97706;
    --bg-light: #FAF8F4;
    --bg-card: #FFFFFF;
    --text-dark: #0B1225;
    --text-muted: #64748B;
    --border: #E2E8F0;
    --shadow: 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06);
    --shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
    --radius: 12px;
    --radius-lg: 20px;
    --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    --font-serif: 'Georgia', serif;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { 
    font-family: var(--font-sans); 
    background: var(--bg-light); 
    color: var(--text-dark);
    line-height: 1.6;
  }

  .container { 
    max-width: 1200px; 
    margin: 0 auto; 
    padding: 0 24px; 
  }

  /* Hero Section */
  .hero {
    background: linear-gradient(135deg, #0B1225 0%, #1E293B 100%);
    color: white;
    padding: 64px 0 48px;
    text-align: center;
  }

  .hero-title {
    font-family: var(--font-serif);
    font-size: clamp(2rem, 5vw, 3rem);
    font-weight: 700;
    line-height: 1.2;
    margin-bottom: 16px;
  }

  .hero-title span {
    color: var(--accent);
  }

  .hero-subtitle {
    font-size: clamp(1rem, 2vw, 1.125rem);
    color: rgba(255,255,255,0.85);
    max-width: 600px;
    margin: 0 auto 32px;
    font-weight: 300;
  }

  .hero-cta {
    display: flex;
    gap: 12px;
    justify-content: center;
    flex-wrap: wrap;
  }

  /* Buttons */
  .btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    border-radius: var(--radius);
    font-weight: 600;
    font-size: 1rem;
    text-decoration: none;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
  }

  .btn-primary {
    background: var(--accent);
    color: var(--text-dark);
  }
  .btn-primary:hover {
    background: var(--accent-dark);
    transform: translateY(-1px);
  }

  .btn-outline {
    background: transparent;
    color: white;
    border: 2px solid rgba(255,255,255,0.3);
  }
  .btn-outline:hover {
    border-color: rgba(255,255,255,0.6);
    background: rgba(255,255,255,0.1);
  }

  /* Section */
  .section {
    padding: 64px 0;
  }

  .section-header {
    text-align: center;
    margin-bottom: 40px;
  }

  .section-title {
    font-family: var(--font-serif);
    font-size: clamp(1.5rem, 3vw, 2rem);
    font-weight: 700;
    margin-bottom: 12px;
  }

  .section-subtitle {
    color: var(--text-muted);
    font-size: 1.05rem;
    max-width: 500px;
    margin: 0 auto;
  }

  /* Internships Grid */
  .internships-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 24px;
  }

  /* Internship Card */
  .card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 24px;
    display: flex;
    flex-direction: column;
    height: 100%;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  .card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;
  }

  .card-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: linear-gradient(135deg, var(--primary), var(--primary-dark));
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
  }

  .status-badge {
    font-size: 0.75rem;
    font-weight: 600;
    padding: 4px 12px;
    border-radius: 999px;
  }
  .status-open {
    background: #DCFCE7;
    color: #166534;
    border: 1px solid #BBF7D0;
  }
  .status-closed {
    background: #FEE2E2;
    color: #991B1B;
    border: 1px solid #FECACA;
  }

  .card-title {
    font-family: var(--font-serif);
    font-weight: 700;
    font-size: 1.125rem;
    color: var(--text-dark);
    margin-bottom: 8px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .card-company {
    font-size: 0.9rem;
    color: var(--text-muted);
    margin-bottom: 16px;
    font-weight: 500;
  }

  .card-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 20px;
    font-size: 0.875rem;
    color: var(--text-muted);
  }

  .card-meta span {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .card-cta {
    margin-top: auto;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 10px 16px;
    background: var(--primary);
    color: white;
    border-radius: 10px;
    font-weight: 600;
    font-size: 0.95rem;
    text-decoration: none;
    transition: background 0.2s;
  }
  .card-cta:hover {
    background: var(--primary-dark);
  }

  /* Loading & Error States */
  .skeleton-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 24px;
    animation: pulse 1.5s ease-in-out infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  .skeleton-line {
    height: 14px;
    background: #E2E8F0;
    border-radius: 6px;
    margin-bottom: 12px;
  }
  .skeleton-line.short { width: 60%; }
  .skeleton-line.medium { width: 80%; }

  .empty-state, .error-state {
    text-align: center;
    padding: 48px 24px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    color: var(--text-muted);
  }
  .error-state .btn {
    margin-top: 16px;
    background: var(--primary);
    color: white;
  }

  /* Responsive */
  @media (max-width: 640px) {
    .hero-cta { flex-direction: column; align-items: center; }
    .btn { width: 100%; justify-content: center; }
  }
`;

/* ── Helpers ── */
const formatDate = (dateString) => {
  if (!dateString) return null;
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
};

/* ── Internship Card Component ── */
const InternshipCard = ({ internship }) => {
  const { 
    _id, id, title, position, company, employer, 
    location, status, deadline, applicationDeadline 
  } = internship;

  const internshipId = _id || id;
  const displayTitle = title || position || "Internship Opportunity";
  const displayCompany = company || employer || "Company";
  const displayLocation = location || "Ethiopia";
  const displayStatus = status || "Open";
  const displayDeadline = deadline || applicationDeadline;
  const isOpen = displayStatus.toLowerCase() === "open";

  return (
    <article className="card">
      <div className="card-header">
        <div className="card-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="7" width="20" height="14" rx="2"/>
            <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
          </svg>
        </div>
        <span className={`status-badge ${isOpen ? 'status-open' : 'status-closed'}`}>
          {displayStatus}
        </span>
      </div>

      <h3 className="card-title">{displayTitle}</h3>
      <p className="card-company">🏢 {displayCompany}</p>

      <div className="card-meta">
        <span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          {displayLocation}
        </span>
        {displayDeadline && (
          <span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            {formatDate(displayDeadline)}
          </span>
        )}
      </div>

      <Link to={`/internships/${internshipId}`} className="card-cta">
        View Details
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M5 12h14"/>
          <path d="m12 5 7 7-7 7"/>
        </svg>
      </Link>
    </article>
  );
};

/* ── Skeleton Loader ── */
const SkeletonCard = () => (
  <div className="skeleton-card">
    <div className="skeleton-line medium" style={{ height: "40px", marginBottom: "20px" }}/>
    <div className="skeleton-line medium"/>
    <div className="skeleton-line short"/>
    <div className="skeleton-line" style={{ marginTop: "24px", height: "36px" }}/>
  </div>
);

/* ════════════════════════════════════════════
   HOME PAGE COMPONENT
════════════════════════════════════════════ */
const Home = () => {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch open internships from database
    const fetchInternships = async () => {
      try {
        const response = await api.get("/internships?limit=6&status=Open");
        setInternships(response.data?.data || response.data || []);
      } catch (err) {
        console.error("Failed to fetch internships:", err);
        setError("Unable to load opportunities. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchInternships();
  }, []);

  return (
    <>
      {/* Inject styles */}
      <style>{styles}</style>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <h1 className="hero-title">
            Find internships <span>that shape careers</span>
          </h1>
          <p className="hero-subtitle">
            Verified opportunities across Ethiopia. Apply smarter with AI-powered tools built for students.
          </p>
          <div className="hero-cta">
            <Link to="/register" className="btn btn-primary">
              Get Started Free
            </Link>
            <Link to="/internships" className="btn btn-outline">
              Browse All Opportunities
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Internships */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Featured Opportunities</h2>
            <p className="section-subtitle">
              Hand-picked, verified internships matched to your profile
            </p>
          </div>

          {loading ? (
            <div className="internships-grid">
              {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : error ? (
            <div className="error-state">
              <p>{error}</p>
              <button className="btn" onClick={() => window.location.reload()}>
                Try Again
              </button>
            </div>
          ) : internships.length === 0 ? (
            <div className="empty-state">
              <p>No internships available right now. Check back soon!</p>
              <Link to="/internships" className="btn btn-primary" style={{ marginTop: "16px" }}>
                View All Listings
              </Link>
            </div>
          ) : (
            <div className="internships-grid">
              {internships.map((item, index) => (
                <InternshipCard 
                  key={item._id || item.id || index} 
                  internship={item} 
                />
              ))}
            </div>
          )}

          {/* View All Link */}
          <div style={{ textAlign: "center", marginTop: 32 }}>
            <Link 
              to="/internships" 
              style={{
                color: "var(--primary)",
                fontWeight: 600,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: "1rem"
              }}
            >
              View all opportunities
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14"/>
                <path d="m12 5 7 7-7 7"/>
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;