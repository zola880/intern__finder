import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowLeft, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  FileText, // File Icon
  Building2,
  CreditCard
} from "lucide-react";
import { INTERNSHIPS } from "../data/internships";
import { useProfile } from "../hooks/useProfile";

const AnnouncementForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const internship = INTERNSHIPS.find((i) => i.id === id);
  const { profile, updateProfile } = useProfile();

  const [formData, setFormData] = useState({
    fullName: profile.fullName || "",
    department: profile.department || "",
    university: profile.university || "",
    year: profile.year || "1",
    bankAccount: profile.bankAccount || "",
  });

  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!internship) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Update profile with form data for future use
    updateProfile({
      fullName: formData.fullName,
      department: formData.department,
      university: formData.university,
      year: formData.year,
      bankAccount: formData.bankAccount,
    });

    setIsSubmitting(false);
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-200 dark:border-emerald-800"
        >
          <CheckCircle2 className="w-12 h-12 text-emerald-600" />
        </motion.div>
        <h1 className="text-4xl font-extrabold text-zinc-900 dark:text-white mb-4 tracking-tight">Announcement Sent!</h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-lg mb-12 leading-relaxed">
          Your university has been successfully notified that you secured an internship at <span className="font-bold text-indigo-600">{internship.companyName}</span>. Your stipend processing will begin shortly.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/internships" className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold transition-all shadow-lg shadow-indigo-600/20">
            Browse More Internships
          </Link>
          <Link to="/" className="px-8 py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-2xl font-bold transition-all">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-zinc-500 hover:text-indigo-600 font-medium mb-8 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back
      </button>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-8 bg-emerald-600 text-white flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Internship Announcement</h1>
            <p className="text-emerald-100 text-sm mt-1">Notify university about {internship.companyName}</p>
          </div>
          <Building2 className="w-10 h-10 text-emerald-200 opacity-50" />
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Full Name</label>
              <input
                required
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl py-3 px-4 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-zinc-900 dark:text-white"
                placeholder="Enter your full name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">University Name</label>
              <input
                required
                type="text"
                value={formData.university}
                onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl py-3 px-4 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-zinc-900 dark:text-white"
                placeholder="e.g. Addis Ababa University"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Department / Field of Study</label>
              <input
                required
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl py-3 px-4 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-zinc-900 dark:text-white"
                placeholder="e.g. Software Engineering"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Year of Study</label>
              <select
                required
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl py-3 px-4 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-zinc-900 dark:text-white"
              >
                {["1", "2", "3", "4", "5"].map(y => (
                  <option key={y} value={y}>Year {y}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-zinc-400" />
              Bank Account Number (for Stipend)
            </label>
            <input
              required
              type="text"
              value={formData.bankAccount}
              onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
              className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl py-3 px-4 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-zinc-900 dark:text-white font-mono"
              placeholder="1000XXXXXXXXX"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Acceptance Letter / Recommendation</label>
            <div className="relative border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 text-center hover:border-indigo-500/50 transition-all group cursor-pointer">
              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6 text-emerald-600" />
                </div>
                {file ? (
                  <div className="flex items-center gap-2 text-emerald-600 font-bold">
                    <FileText className="w-4 h-4" />
                    {file.name}
                  </div>
                ) : (
                  <>
                    <p className="font-bold text-zinc-900 dark:text-white">Click to upload or drag and drop</p>
                    <p className="text-xs text-zinc-500">PDF, PNG or JPG (max 5MB)</p>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-400 text-white rounded-2xl font-bold text-lg transition-all shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  >
                    <AlertCircle className="w-5 h-5" />
                  </motion.div>
                  Sending Announcement...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Send Announcement
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AnnouncementForm;
