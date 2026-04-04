import React from "react";
import { Link } from "react-router-dom";
import { INTERNSHIPS } from "../data/internships";
import InternshipCard from "../components/InternshipCard";

const Home = () => {
  const featuredInternships = INTERNSHIPS.filter(i => i.status === "Open").slice(0, 3);

  return (
    <div className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white">

      {/* HERO */}
      <section className="max-w-6xl mx-auto px-4 py-24 text-center">
        <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
          Find Internships in Ethiopia
        </h1>

        <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto mb-10">
          Discover verified internship opportunities and grow your career with confidence.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            to="/internships"
            className="px-6 py-3 bg-black text-white dark:bg-white dark:text-black rounded-lg font-medium hover:opacity-90 transition"
          >
            Browse Internships
          </Link>

          <Link
            to="/ai-assistant"
            className="px-6 py-3 border border-zinc-300 dark:border-zinc-700 rounded-lg font-medium hover:bg-zinc-100 dark:hover:bg-zinc-900 transition"
          >
            AI Assistant
          </Link>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-semibold text-center mb-12">
          How it works
        </h2>

        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div>
            <h3 className="font-medium mb-2">1. Browse</h3>
            <p className="text-sm text-zinc-500">
              Explore available internships across different fields.
            </p>
          </div>

          <div>
            <h3 className="font-medium mb-2">2. Apply</h3>
            <p className="text-sm text-zinc-500">
              Submit your application quickly and easily.
            </p>
          </div>

          <div>
            <h3 className="font-medium mb-2">3. Get Guidance</h3>
            <p className="text-sm text-zinc-500">
              Use AI tools to improve your chances of success.
            </p>
          </div>
        </div>
      </section>

      {/* FEATURED */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-semibold">Featured Internships</h2>
          <Link to="/internships" className="text-sm text-blue-600">
            View all
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {featuredInternships.map((internship) => (
            <InternshipCard key={internship.id} internship={internship} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-semibold mb-4">
          Start your career journey today
        </h2>

        <p className="text-zinc-500 mb-8">
          Join students finding real opportunities across Ethiopia.
        </p>

        <Link
          to="/internships"
          className="px-6 py-3 bg-black text-white dark:bg-white dark:text-black rounded-lg font-medium hover:opacity-90 transition"
        >
          Get Started
        </Link>
      </section>

    </div>
  );
};

export default Home;