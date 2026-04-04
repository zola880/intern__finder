import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Clock, 
  ExternalLink, 
  CheckCircle2, 
  Briefcase,
  Share2,
  Bookmark,
  Loader2
} from "lucide-react";
import api from "../services/api";
import { useProfile } from "../hooks/useProfile";

const InternshipDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useProfile();
  const [internship, setInternship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [internshipRes, savedRes] = await Promise.all([
          api.get(`/internships/${id}`),
          user ? api.get("/saved") : Promise.resolve({ data: [] })
        ]);
        setInternship(internshipRes.data);
        if (user) {
          const savedIds = savedRes.data.map(i => i._id);
          setIsSaved(savedIds.includes(id));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, user]);

  const toggleSave = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    setSaving(true);
    try {
      if (isSaved) {
        await api.delete(`/saved/${id}`);
        setIsSaved(false);
      } else {
        await api.post(`/saved/${id}`);
        setIsSaved(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mx-auto" />
      </div>
    );
  }

  if (!internship) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-bold mb-4">Internship not found</h2>
        <Link to="/internships" className="text-indigo-600 font-bold">Return to listings</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-zinc-500 hover:text-indigo-600 font-medium mb-8 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Internships
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-12">
          <section>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center font-bold text-indigo-600 text-2xl border border-zinc-200 dark:border-zinc-700">
                {internship.companyName.charAt(0)}
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                  {internship.companyName}
                </h1>
                <div className="flex items-center gap-4 mt-1">
                  <div className="flex items-center gap-1 text-sm text-zinc-500">
                    <MapPin className="w-4 h-4" />
                    {internship.location}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-zinc-500">
                    <Briefcase className="w-4 h-4" />
                    {internship.field}
                  </div>
                </div>
              </div>
            </div>

            <div className="prose prose-zinc dark:prose-invert max-w-none">
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">About the Role</h3>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-8">
                {internship.fullDescription}
              </p>

              <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">Required Skills</h3>
              <div className="flex flex-wrap gap-3 mb-8">
                {internship.requiredSkills.map((skill, i) => (
                  <div key={i} className="flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl text-sm font-medium border border-zinc-200 dark:border-zinc-700">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                    {skill}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="p-8 bg-indigo-50 dark:bg-indigo-900/10 rounded-3xl border border-indigo-100 dark:border-indigo-800/50">
            <h3 className="text-xl font-bold text-indigo-900 dark:text-indigo-100 mb-6">Application Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-white dark:bg-zinc-900 rounded-xl flex items-center justify-center shadow-sm">
                  <Clock className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold mb-1">Duration</p>
                  <p className="font-bold text-zinc-900 dark:text-white">{internship.duration}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-white dark:bg-zinc-900 rounded-xl flex items-center justify-center shadow-sm">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold mb-1">Deadline</p>
                  <p className="font-bold text-zinc-900 dark:text-white">{new Date(internship.deadline).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6">
          <div className="p-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm sticky top-24">
            <h4 className="font-bold text-zinc-900 dark:text-white mb-6">Ready to apply?</h4>
            <div className="space-y-4">
              <a
                href={internship.website}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
              >
                Apply Now
                <ExternalLink className="w-4 h-4" />
              </a>
              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <p className="text-xs text-zinc-500 mb-3">Already secured this internship?</p>
                <Link
                  to={`/announce/${internship._id}`}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 text-sm"
                >
                  Announce to University
                </Link>
              </div>
            </div>

            <div className="flex gap-4 mt-8 pt-8 border-t border-zinc-100 dark:border-zinc-800">
              <button 
                onClick={toggleSave}
                disabled={saving}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                  isSaved 
                    ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600" 
                    : "bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100"
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
                {isSaved ? "Saved" : "Save"}
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-xl text-sm font-bold hover:bg-zinc-100 transition-all">
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InternshipDetail;