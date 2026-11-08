import React, { useEffect, useState } from "react";
import { BriefcaseBusiness, Download, FileText, LoaderCircle, Mail, Phone, UserRound } from "lucide-react";
import api from "../services/api";

const EmployerApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    api.get("/applications/received")
      .then(({ data }) => setApplications(data))
      .catch(err => setError(err.response?.data?.message || "Could not load received applications."))
      .finally(() => setLoading(false));
  }, []);

  const downloadCv = async (application) => {
    setDownloadingId(application.id);
    setError("");
    try {
      const { data } = await api.get(`/applications/${application.id}/cv`, { responseType: "blob" });
      const url = URL.createObjectURL(data);
      const link = document.createElement("a");
      link.href = url;
      link.download = `application-${application.id}-cv.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.response?.data?.message || "Could not download the applicant's CV.");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-8 flex items-start gap-4">
        <div className="rounded-2xl bg-indigo-100 p-3 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300">
          <BriefcaseBusiness className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white sm:text-3xl">Internship applications</h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Review students who have applied to your internship listings.</p>
        </div>
      </div>

      {error && <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">{error}</div>}
      {loading ? (
        <div className="flex justify-center py-20"><LoaderCircle className="h-9 w-9 animate-spin text-indigo-600" /></div>
      ) : applications.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-zinc-300 py-16 text-center dark:border-zinc-700">
          <FileText className="mx-auto h-10 w-10 text-zinc-400" />
          <h2 className="mt-4 font-bold text-zinc-800 dark:text-white">No applications yet</h2>
          <p className="mt-2 text-sm text-zinc-500">Applications will appear here when students apply to your listings.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map(application => (
            <article key={application.id} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                    <BriefcaseBusiness className="h-3.5 w-3.5" />
                    {application.company_name} · {application.field}
                  </span>
                  <p className="mt-2 text-sm font-medium text-zinc-600 dark:text-zinc-300">{application.short_description}</p>
                  <h2 className="mt-3 flex items-center gap-2 text-lg font-bold text-zinc-900 dark:text-white">
                    <UserRound className="h-5 w-5 text-zinc-400" />
                    {application.full_name}
                  </h2>
                  <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm text-zinc-600 dark:text-zinc-300">
                    <a href={`mailto:${application.email}`} className="inline-flex items-center gap-1.5 hover:text-indigo-600"><Mail className="h-4 w-4" />{application.email}</a>
                    <a href={`tel:${application.phone}`} className="inline-flex items-center gap-1.5 hover:text-indigo-600"><Phone className="h-4 w-4" />{application.phone}</a>
                  </div>
                  <p className="mt-3 text-xs text-zinc-400">Applied {new Date(application.submitted_at).toLocaleString()}</p>
                </div>
                <button
                  type="button"
                  disabled={downloadingId === application.id}
                  onClick={() => downloadCv(application)}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:opacity-60"
                >
                  {downloadingId === application.id ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  Download CV
                </button>
              </div>
              <div className="mt-5 border-t border-zinc-100 pt-4 dark:border-zinc-800">
                <h3 className="text-xs font-bold uppercase tracking-wide text-zinc-500">Cover letter</h3>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-700 dark:text-zinc-300">{application.cover_letter}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployerApplications;
