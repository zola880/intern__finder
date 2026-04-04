import React, { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { Search, Loader2, AlertCircle, PlusCircle, Briefcase } from "lucide-react";
import { Link } from "react-router-dom";
import InternshipCard from "../components/InternshipCard";
import api from "../services/api";
import { useProfile } from "../hooks/useProfile";

const InternshipList = () => {
  const { user } = useProfile();
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedField, setSelectedField] = useState("All");
  const [pagination, setPagination] = useState({ page: 1, limit: 9, total: 0 });

  const fields = ["All", "IT", "Business", "Engineering", "Health", "Other"];

  const fetchInternships = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        search: searchTerm || undefined,
        field: selectedField === "All" ? undefined : selectedField,
        page: pagination.page,
        limit: pagination.limit,
      };
      const { data } = await api.get("/internships", { params });
      setInternships(data.data);
      setPagination((prev) => ({ ...prev, total: data.pagination.total }));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load internships.");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedField, pagination.page, pagination.limit]);

  useEffect(() => {
    const timer = setTimeout(fetchInternships, 300);
    return () => clearTimeout(timer);
  }, [fetchInternships]);

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedField("All");
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-zinc-50 dark:from-zinc-950 dark:to-zinc-900">
      {/* Hero Section */}
      <div className="bg-indigo-600 dark:bg-indigo-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-80" />
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3 tracking-tight">
            Find Your Future Internship
          </h1>
          <p className="text-indigo-100 text-lg max-w-2xl mx-auto">
            Discover opportunities from Ethiopia's top companies. Start your professional journey today.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search + Filter Bar */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-4 mb-10">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <input
                type="text"
                placeholder="Search by company, role, or skill..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
              {fields.map((field) => (
                <button
                  key={field}
                  onClick={() => {
                    setSelectedField(field);
                    setPagination(prev => ({ ...prev, page: 1 }));
                  }}
                  className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    selectedField === field
                      ? "bg-indigo-600 text-white shadow-md"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  }`}
                >
                  {field}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Header with result count and post button */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
              {pagination.total} Internships Available
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              {searchTerm && `Showing results for "${searchTerm}"`}
              {selectedField !== "All" && ` in ${selectedField}`}
            </p>
          </div>
          {user && (
            <Link
              to="/post-internship"
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition-all shadow-md hover:shadow-lg"
            >
              <PlusCircle className="w-5 h-5" />
              Post an Internship
            </Link>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-32">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
          </div>
        ) : error ? (
          <div className="text-center py-32">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <p className="text-zinc-600 dark:text-zinc-400">{error}</p>
            <button onClick={fetchInternships} className="mt-4 text-indigo-600 font-semibold hover:underline">
              Try again
            </button>
          </div>
        ) : internships.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {internships.map((internship) => (
                <InternshipCard key={internship._id} internship={internship} />
              ))}
            </div>
            {pagination.total > pagination.limit && (
              <div className="flex justify-center gap-3 mt-12">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 disabled:opacity-40 text-sm font-medium"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-zinc-600 dark:text-zinc-400 text-sm">
                  Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page * pagination.limit >= pagination.total}
                  className="px-5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 disabled:opacity-40 text-sm font-medium"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-32">
            <Search className="w-16 h-16 text-zinc-300 dark:text-zinc-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">No internships found</h3>
            <p className="text-zinc-500 dark:text-zinc-400">Try adjusting your search or filters.</p>
            <button onClick={clearFilters} className="mt-4 text-indigo-600 font-semibold hover:underline">
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InternshipList;