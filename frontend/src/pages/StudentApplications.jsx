import React, { useEffect, useState } from "react";
import { BriefcaseBusiness, CalendarDays, FileText, LoaderCircle } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { getFileUrl } from "../utils/fileUrl";

const StudentApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/applications/mine")
      .then(({ data }) => setApplications(data))
      .catch(err => setError(err.response?.data?.message || "Could not load your applications."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white sm:text-3xl">My internship applications</h1>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Track the applications you submitted to host companies.</p>
      {error && <div role="alert" className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">{error}</div>}
      {loading ? (
        <div className="flex justify-center py-20"><LoaderCircle className="h-9 w-9 animate-spin text-indigo-600" /></div>
      ) : applications.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-zinc-300 py-16 text-center dark:border-zinc-700">
          <BriefcaseBusiness className="mx-auto h-10 w-10 text-zinc-400" />
          <p className="mt-4 text-sm text-zinc-500">You haven’t applied to any internships yet.</p>
          <Link to="/internships" className="mt-4 inline-flex rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-700">Browse internships</Link>
        </div>
      ) : (
        <div className="mt-7 space-y-4">
          {applications.map(application => (
            <article key={application.id} className="flex items-start gap-4 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              {application.company_logo_url ? (
                <img src={getFileUrl(application.company_logo_url)} alt="" className="h-12 w-12 rounded-xl object-cover" />
              ) : (
                <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300"><BriefcaseBusiness className="h-6 w-6" /></div>
              )}
              <div className="min-w-0 flex-1">
                <h2 className="font-bold text-zinc-900 dark:text-white">{application.company_name}</h2>
                <p className="mt-1 text-sm text-zinc-500">{application.field} · {application.location}</p>
                <p className="mt-2 flex items-center gap-1.5 text-xs text-zinc-400"><CalendarDays className="h-3.5 w-3.5" />Submitted {new Date(application.submitted_at).toLocaleDateString()}</p>
                <Link to={`/internships/${application.internship_id}`} className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-300"><FileText className="h-3.5 w-3.5" />View internship</Link>
              </div>
              <span className="shrink-0 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">{application.status}</span>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentApplications;
