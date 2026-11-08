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
  Loader2,
  FileText,
  Upload,
  CheckCircle,
} from "lucide-react";
import api from "../services/api";
import { useProfile } from "../hooks/useProfile";
import { getFileUrl } from "../utils/fileUrl";

const InternshipDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useProfile();
  const [internship, setInternship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [applicationOpen, setApplicationOpen] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [applicationLoading, setApplicationLoading] = useState(false);
  const [applicationError, setApplicationError] = useState("");
  const [applicationSuccess, setApplicationSuccess] = useState(false);
  const [applicationForm, setApplicationForm] = useState({
    fullName: user?.fullName || "",
    phone: "",
    coverLetter: "",
  });
  const [cv, setCv] = useState(null);

  useEffect(() => {
    setHasApplied(false);
    setApplicationSuccess(false);
    setApplicationOpen(false);
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
        if (user?.role === "STUDENT") {
          try {
            const { data } = await api.get("/applications/mine");
            setHasApplied(data.some(application => String(application.internship_id) === String(id)));
          } catch (applicationFetchError) {
            console.error("Could not check existing internship applications:", applicationFetchError);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, user]);

  useEffect(() => {
    setApplicationForm(current => ({ ...current, fullName: user?.fullName || "" }));
  }, [user]);

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

  const handleApplicationSubmit = async (event) => {
    event.preventDefault();
    if (!cv) {
      setApplicationError("Please attach your CV as a PDF.");
      return;
    }
    setApplicationLoading(true);
    setApplicationError("");
    try {
      const payload = new FormData();
      payload.append("fullName", applicationForm.fullName);
      payload.append("phone", applicationForm.phone);
      payload.append("coverLetter", applicationForm.coverLetter);
      payload.append("cv", cv);
      await api.post(`/applications/${id}`, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setHasApplied(true);
      setApplicationSuccess(true);
      setApplicationOpen(false);
    } catch (err) {
      setApplicationError(err.response?.data?.message || "Could not submit your application.");
    } finally {
      setApplicationLoading(false);
    }
  };

  const handleApply = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.role !== "STUDENT") return;
    setApplicationError("");
    setApplicationSuccess(false);
    setApplicationOpen(open => !open);
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-zinc-500 hover:text-indigo-600 font-medium mb-6 sm:mb-8 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Internships
      </button>

      {/* Use flex column on mobile, grid on desktop */}
      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-8 lg:gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8 sm:space-y-12">
          <section>
            <div className="flex items-center gap-3 sm:gap-4 mb-5 sm:mb-6">
              {internship.companyLogoUrl ? (
                <img src={getFileUrl(internship.companyLogoUrl)} alt={`${internship.companyName} logo`} className="h-12 w-12 rounded-2xl border border-zinc-200 object-cover dark:border-zinc-700 sm:h-16 sm:w-16" />
              ) : (
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center font-bold text-indigo-600 text-xl sm:text-2xl border border-zinc-200 dark:border-zinc-700">
                  {internship.companyName.charAt(0)}
                </div>
              )}
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight break-words">
                  {internship.companyName}
                </h1>
                <div className="flex flex-wrap gap-2 sm:gap-4 mt-1">
                  <div className="flex items-center gap-1 text-xs sm:text-sm text-zinc-500">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                    {internship.location}
                  </div>
                  <div className="flex items-center gap-1 text-xs sm:text-sm text-zinc-500">
                    <Briefcase className="w-3 h-3 sm:w-4 sm:h-4" />
                    {internship.field}
                  </div>
                </div>
              </div>
            </div>

            <div className="prose prose-zinc dark:prose-invert max-w-none">
              <h3 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white mb-3">About the Role</h3>
              <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">
                {internship.fullDescription}
              </p>

              <h3 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white mb-3">Required Skills</h3>
              <div className="flex flex-wrap gap-2 sm:gap-3 mb-6">
                {internship.requiredSkills.map((skill, i) => (
                  <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs sm:text-sm font-medium border border-zinc-200 dark:border-zinc-700">
                    <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-600" />
                    {skill}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="p-5 sm:p-8 bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl sm:rounded-3xl border border-indigo-100 dark:border-indigo-800/50">
            <h3 className="text-lg sm:text-xl font-bold text-indigo-900 dark:text-indigo-100 mb-5">Application Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white dark:bg-zinc-900 rounded-xl flex items-center justify-center shadow-sm">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold mb-1">Duration</p>
                  <p className="font-bold text-zinc-900 dark:text-white text-sm sm:text-base">{internship.duration}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white dark:bg-zinc-900 rounded-xl flex items-center justify-center shadow-sm">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold mb-1">Deadline</p>
                  <p className="font-bold text-zinc-900 dark:text-white text-sm sm:text-base">{new Date(internship.deadline).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar Actions – sticky on desktop, normal on mobile */}
        <div className="space-y-6">
          <div className="p-5 sm:p-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl sm:rounded-3xl shadow-sm lg:sticky lg:top-24">
            <h4 className="font-bold text-zinc-900 dark:text-white mb-5 text-lg">Ready to apply?</h4>
            <div className="space-y-3">
              {user?.role === "STUDENT" && (hasApplied || applicationSuccess) ? (
                <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 py-3 text-sm font-bold text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">
                  <CheckCircle className="h-5 w-5" />
                  Application submitted
                </div>
              ) : (!user || user.role === "STUDENT") && (
                <button
                  type="button"
                  onClick={handleApply}
                  disabled={internship.status !== "Open" || (internship.deadline && new Date(internship.deadline) < new Date())}
                  className="w-full py-3 sm:py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-400 text-white rounded-xl sm:rounded-2xl font-bold transition-all shadow-md flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  {!user ? "Sign in to apply" : applicationOpen ? "Close application" : "Apply on EthioInternAI"}
                  <FileText className="w-4 h-4" />
                </button>
              )}
              {internship.website && (
                <a
                  href={internship.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800"
                >
                  External application page
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
              {internship.applicationFormUrl && (
                <a
                  href={getFileUrl(internship.applicationFormUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 border border-indigo-100 dark:border-indigo-800/50 bg-indigo-50/60 dark:bg-indigo-900/10 text-indigo-700 dark:text-indigo-300 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 text-sm hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                >
                  <FileText className="h-4 w-4" />
                  Download company application form
                </a>
              )}
              {applicationSuccess && (
                <p className="rounded-xl bg-emerald-50 p-3 text-xs leading-5 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">
                  Your application was sent to {internship.companyName}. You can track it from your profile.
                </p>
              )}
              {applicationOpen && !hasApplied && (
                <form onSubmit={handleApplicationSubmit} className="space-y-3 rounded-2xl border border-zinc-200 p-4 dark:border-zinc-700">
                  <h5 className="font-bold text-zinc-900 dark:text-white">Your application</h5>
                  {applicationError && <p role="alert" className="rounded-lg bg-red-50 p-2 text-xs text-red-700 dark:bg-red-900/20 dark:text-red-300">{applicationError}</p>}
                  <label className="block space-y-1">
                    <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">Full name</span>
                    <input required minLength={2} maxLength={255} value={applicationForm.fullName} onChange={event => setApplicationForm({ ...applicationForm, fullName: event.target.value })} className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800" />
                  </label>
                  <label className="block space-y-1">
                    <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">Email</span>
                    <input value={user?.email || ""} readOnly className="w-full rounded-lg border border-zinc-200 bg-zinc-100 px-3 py-2 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800" />
                  </label>
                  <label className="block space-y-1">
                    <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">Phone number</span>
                    <input required type="tel" value={applicationForm.phone} onChange={event => setApplicationForm({ ...applicationForm, phone: event.target.value })} placeholder="+251..." className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800" />
                  </label>
                  <label className="block space-y-1">
                    <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">Cover letter</span>
                    <textarea required minLength={20} maxLength={10000} rows={5} value={applicationForm.coverLetter} onChange={event => setApplicationForm({ ...applicationForm, coverLetter: event.target.value })} placeholder="Tell the company why you're interested in this internship..." className="w-full resize-y rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800" />
                  </label>
                  <label className="block space-y-1">
                    <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">CV (PDF, max 5 MB)</span>
                    <input required type="file" accept="application/pdf,.pdf" onChange={event => {
                      const file = event.target.files?.[0] || null;
                      if (file && (file.type !== "application/pdf" || file.size > 5 * 1024 * 1024)) {
                        setCv(null);
                        setApplicationError(file.size > 5 * 1024 * 1024 ? "CV must be 5 MB or smaller." : "CV must be a PDF.");
                        event.target.value = "";
                        return;
                      }
                      setCv(file);
                      setApplicationError("");
                    }} className="w-full text-xs text-zinc-600 file:mr-2 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:font-semibold file:text-indigo-700 dark:text-zinc-300 dark:file:bg-indigo-900/20 dark:file:text-indigo-300" />
                  </label>
                  <button disabled={applicationLoading} type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-60">
                    {applicationLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    {applicationLoading ? "Submitting…" : "Submit application"}
                  </button>
                </form>
              )}
              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <p className="text-xs text-zinc-500 mb-2">Already secured this internship?</p>
                <Link
                  to={`/announce/${internship._id}`}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2 text-sm"
                >
                  Announce to University
                </Link>
              </div>
            </div>

            <div className="flex gap-3 sm:gap-4 mt-6 sm:mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800">
              <button 
                onClick={toggleSave}
                disabled={saving}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 sm:py-3 rounded-xl text-sm font-bold transition-all ${
                  isSaved 
                    ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600" 
                    : "bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100"
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
                {isSaved ? "Saved" : "Save"}
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-2.5 sm:py-3 bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-xl text-sm font-bold hover:bg-zinc-100 transition-all">
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