import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { MapPin, Briefcase, Calendar, ChevronRight, Bookmark } from "lucide-react";
import { useProfile } from "../hooks/useProfile";
import api from "../services/api";

const InternshipCard = ({ internship }) => {
  const { user } = useProfile();
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const checkSaved = async () => {
      if (!user || !internship?._id) return;
      try {
        const { data } = await api.get("/saved");
        const savedIds = data.map(i => i._id);
        setIsSaved(savedIds.includes(internship._id));
      } catch (err) {
        console.error("Error checking saved status:", err);
      }
    };
    checkSaved();
  }, [user, internship]);

  const toggleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    setSaving(true);
    try {
      if (isSaved) {
        await api.delete(`/saved/${internship._id}`);
        setIsSaved(false);
      } else {
        await api.post(`/saved/${internship._id}`);
        setIsSaved(true);
      }
    } catch (err) {
      console.error("Error toggling save:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all group"
    >
      <div className="p-4 sm:p-5 md:p-6">
        <div className="flex justify-between items-start gap-2 mb-3">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center font-bold text-indigo-600 text-base sm:text-lg">
              {internship.companyName?.charAt(0) || "?"}
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-zinc-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                {internship.companyName}
              </h3>
              <div className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                <MapPin className="w-3 h-3" />
                {internship.location}
              </div>
            </div>
          </div>
          {user && (
            <button 
              onClick={toggleSave}
              disabled={saving}
              className="p-2 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <Bookmark className={`w-5 h-5 ${isSaved ? "fill-indigo-600 text-indigo-600" : "text-zinc-400"}`} />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-[11px] font-bold uppercase tracking-wider rounded-full">
            {internship.field}
          </span>
          <span className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full ${
            internship.status === "Open" 
              ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400" 
              : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
          }`}>
            {internship.status}
          </span>
        </div>

        <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 mb-4 leading-relaxed">
          {internship.shortDescription}
        </p>

        <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-1 text-xs text-zinc-500">
            <Calendar className="w-3 h-3" />
            <span>Deadline: {new Date(internship.deadline).toLocaleDateString()}</span>
          </div>
          <Link 
            to={`/internships/${internship._id}`}
            className="flex items-center gap-1 text-sm font-bold text-indigo-600 py-2 px-3 rounded-full hover:bg-indigo-50 transition-all"
          >
            View Details
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default InternshipCard;