import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import InternshipCard from "../components/InternshipCard";

const Home = () => {
  const [featuredInternships, setFeaturedInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data } = await api.get("/internships?limit=3&status=Open");
        setFeaturedInternships(data.data);
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
    <div className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white">

      {/* HERO - mobile optimized */}
      <section className="px-4 py-12 sm:py-20 md:py-24 text-center max-w-6xl mx-auto">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight mb-4 sm:mb-6">
          Find Internships in Ethiopia
        </h1>
        <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto mb-6 sm:mb-10">
          Discover verified internship opportunities and grow your career with confidence.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <Link
            to="/internships"
            className="w-full sm:w-auto px-6 py-3 bg-black text-white dark:bg-white dark:text-black rounded-xl font-semibold text-center hover:opacity-90 transition"
          >
            Browse Internships
          </Link>
          <Link
            to="/ai-assistant"
            className="w-full sm:w-auto px-6 py-3 border border-zinc-300 dark:border-zinc-700 rounded-xl font-semibold text-center hover:bg-zinc-100 dark:hover:bg-zinc-900 transition"
          >
            AI Assistant
          </Link>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="px-4 py-12 sm:py-16 max-w-5xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">
          How it works
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          <div>
            <h3 className="text-lg font-semibold mb-2">1. Browse</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Explore available internships across different fields.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">2. Apply</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Submit your application quickly and easily.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">3. Get Guidance</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Use AI tools to improve your chances of success.
            </p>
          </div>
        </div>
      </section>

      {/* FEATURED */}
      <section className="px-4 py-12 sm:py-16 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold">Featured Internships</h2>
          <Link to="/internships" className="text-indigo-600 text-sm font-medium hover:underline">
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-zinc-500">
            <p>Failed to load internships. Please try again later.</p>
          </div>
        ) : featuredInternships.length === 0 ? (
          <div className="text-center py-12 text-zinc-500">
            <p>No internships available at the moment. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {featuredInternships.map((internship) => (
              <InternshipCard key={internship._id} internship={internship} />
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="px-4 py-16 sm:py-20 text-center max-w-4xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4">
          Start your career journey today
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400 mb-6 sm:mb-8">
          Join students finding real opportunities across Ethiopia.
        </p>
        <Link
          to="/internships"
          className="inline-block px-6 py-3 bg-black text-white dark:bg-white dark:text-black rounded-xl font-semibold hover:opacity-90 transition"
        >
          Get Started
        </Link>
      </section>

    </div>
  );
};

export default Home;