import React from "react";
import { motion } from "motion/react";
import {
  ArrowRight,
  Bot,
  BriefcaseBusiness,
  CheckCircle2,
  FileText,
  Image,
  Mic,
  Search,
  ShieldCheck,
  Upload,
  UserPlus,
} from "lucide-react";
import { Link } from "react-router-dom";

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Create your account",
    description:
      "Join as a student looking for experience or as a host company ready to meet emerging talent.",
  },
  {
    number: "02",
    icon: Search,
    title: "Find the right opportunity",
    description:
      "Explore internship listings by field and location. Review the role, requirements, deadline, and any company-provided application form.",
  },
  {
    number: "03",
    icon: FileText,
    title: "Apply with confidence",
    description:
      "Students submit their contact details, a cover letter, and a PDF CV directly through the internship listing.",
  },
  {
    number: "04",
    icon: BriefcaseBusiness,
    title: "Connect with a host",
    description:
      "Host companies publish opportunities, then review applicants and download CVs from their Applicants dashboard.",
  },
];

const HowItWorks = () => (
  <div className="min-h-screen bg-gradient-to-b from-white via-indigo-50/30 to-white text-zinc-900 dark:from-zinc-950 dark:via-indigo-950/10 dark:to-zinc-950 dark:text-white">
    <section className="relative overflow-hidden border-b border-zinc-200/80 dark:border-zinc-800">
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-indigo-200/40 blur-3xl dark:bg-indigo-500/10" />
      <div className="relative mx-auto max-w-6xl px-4 py-16 text-center sm:px-6 sm:py-24">
        <span className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-indigo-700 shadow-sm dark:border-indigo-400/20 dark:bg-white/5 dark:text-indigo-300">
          <CheckCircle2 className="h-4 w-4" />
          Your path from search to opportunity
        </span>
        <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-black tracking-tight sm:text-6xl">
          Great opportunities.
          <span className="block bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">Clear next steps.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-zinc-600 dark:text-zinc-300 sm:text-lg">
          EthioInternAI helps students discover internships, prepare with AI, and apply directly to host companies.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/internships" className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700">
            Explore internships <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/register" className="rounded-xl border border-zinc-200 bg-white px-5 py-3 text-sm font-bold text-zinc-700 transition hover:border-indigo-200 hover:text-indigo-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
            Create an account
          </Link>
        </div>
      </div>
    </section>

    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
      <div className="mx-auto mb-10 max-w-2xl text-center">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-300">Simple from start to finish</p>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">How the platform works</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map(({ number, icon: Icon, title, description }, index) => (
          <motion.article
            key={number}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.08 }}
            className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-300">
                <Icon className="h-6 w-6" />
              </span>
              <span className="text-sm font-bold text-zinc-300 dark:text-zinc-600">{number}</span>
            </div>
            <h3 className="mt-5 text-lg font-bold">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">{description}</p>
          </motion.article>
        ))}
      </div>
    </section>

    <section className="border-y border-zinc-200 bg-white/70 py-14 dark:border-zinc-800 dark:bg-zinc-900/40 sm:py-20">
      <div className="mx-auto grid max-w-6xl gap-5 px-4 sm:px-6 lg:grid-cols-2">
        <article className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-6 dark:border-indigo-400/15 dark:from-indigo-950/40 dark:to-zinc-900 sm:p-8">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
            <Bot className="h-6 w-6" />
          </span>
          <h2 className="mt-5 text-2xl font-extrabold">Your AI career assistant</h2>
          <p className="mt-3 text-sm leading-7 text-zinc-600 dark:text-zinc-300">
            Ask career questions and get internship guidance personalized with the profile details you provide. The assistant can also help you understand images you share.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {[
              { icon: Bot, text: "Text conversation" },
              { icon: Image, text: "Image questions" },
              { icon: Mic, text: "Voice input and replies" },
            ].map(({ icon: Icon, text }) => (
              <span key={text} className="inline-flex items-center gap-1.5 rounded-full border border-indigo-100 bg-white/80 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:border-indigo-400/15 dark:bg-white/5 dark:text-indigo-200">
                <Icon className="h-3.5 w-3.5" />{text}
              </span>
            ))}
          </div>
          <p className="mt-5 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
            AI suggestions are guidance, not a guarantee of placement. Always verify opportunity details with the host company.
          </p>
        </article>

        <article className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
            <ShieldCheck className="h-6 w-6" />
          </span>
          <h2 className="mt-5 text-2xl font-extrabold">For host companies</h2>
          <ol className="mt-4 space-y-4">
            <li className="flex gap-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs font-bold text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">1</span>
              Register using the host-company account option.
            </li>
            <li className="flex gap-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs font-bold text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">2</span>
              Post an internship with role details, deadline, logo, and an optional application-form PDF. New postings are reviewed before publication.
            </li>
            <li className="flex gap-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs font-bold text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">3</span>
              Open Applicants to review cover letters and contact details, and securely download CVs.
            </li>
          </ol>
        </article>

        <article className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 sm:p-8 lg:col-span-2">
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-700 dark:bg-violet-400/10 dark:text-violet-300">
                <Upload className="h-6 w-6" />
              </span>
              <h2 className="mt-5 text-2xl font-extrabold">For students</h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-600 dark:text-zinc-300">
                Build your profile, browse open internships, and apply from the opportunity page. Each application includes your name, account email, phone number, cover letter, and CV PDF. Track submissions later from your profile under <strong>Job Applications</strong>. If a host provides its own form, you can download it from the listing too.
              </p>
            </div>
            <Link to="/internships" className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-indigo-200">
              Find an internship <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </article>
      </div>
    </section>

    <section className="mx-auto max-w-4xl px-4 py-14 text-center sm:px-6 sm:py-20">
      <h2 className="text-3xl font-extrabold tracking-tight">Ready to take the next step?</h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-zinc-500 dark:text-zinc-400">
        Students can explore opportunities; host companies can share openings with Ethiopia’s next generation of talent.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link to="/register" className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-700">Get started</Link>
        <Link to="/internships" className="rounded-xl border border-zinc-200 px-5 py-3 text-sm font-bold text-zinc-700 hover:border-indigo-200 dark:border-zinc-700 dark:text-zinc-200">Browse internships</Link>
      </div>
    </section>
  </div>
);

export default HowItWorks;
