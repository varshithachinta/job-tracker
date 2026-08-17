"use client";

import { useState } from "react";
import { useApplications } from "@/lib/useApplications";
import { ApplicationStatus } from "@/lib/types";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import AddApplicationModal from "@/components/AddApplicationModal";
import ApplicationDetailModal from "@/components/ApplicationDetailModal";
import { Application } from "@/lib/types";

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  applied: "Applied",
  oa: "Screening",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
};

const STATUS_STYLES: Record<ApplicationStatus, string> = {
  applied: "bg-applied-bg text-applied",
  oa: "bg-screening-bg text-screening",
  interview: "bg-interview-bg text-interview",
  offer: "bg-offer-bg text-offer",
  rejected: "bg-rejected-bg text-rejected",
};

const STATUS_FILTERS: { label: string; value: ApplicationStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Applied", value: "applied" },
  { label: "Screening", value: "oa" },
  { label: "Interview", value: "interview" },
  { label: "Offer", value: "offer" },
  { label: "Rejected", value: "rejected" },
];

function initials(name: string) {
  return name.slice(0, 2);
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function DashboardPage() {
  const { applications, setApplications, loading, error } = useApplications();
  const [filter, setFilter] = useState<ApplicationStatus | "all">("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  const counts = {
    applied: applications.filter((a) => a.status === "applied").length,
    oa: applications.filter((a) => a.status === "oa").length,
    interview: applications.filter((a) => a.status === "interview").length,
    offer: applications.filter((a) => a.status === "offer").length,
  };

  const filtered =
    filter === "all"
      ? applications
      : applications.filter((a) => a.status === filter);

  return (
    <div className="flex min-h-screen bg-bg pb-16 md:pb-0">
      <Sidebar />

      <div className="flex-1 p-5 md:p-9 min-w-0">
        <div className="md:hidden -mx-5 -mt-5 mb-5 bg-navy text-white px-5 pt-6 pb-4 rounded-b-2xl flex items-center justify-between">
          <div>
            <h1 className="font-display text-lg font-medium mb-0.5">
              Hi, Varshu
            </h1>
            <p className="text-xs text-[#9CA1AF]">
              {applications.length} active application
              {applications.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="w-10 h-10 rounded-full bg-brass flex items-center justify-center text-xl shrink-0"
          >
            +
          </button>
        </div>

        <div className="hidden md:flex items-baseline justify-between mb-7">
          <div>
            <h1 className="font-display text-[26px] font-medium mb-1">
              Applications
            </h1>
            <p className="text-text-secondary text-sm">
              {applications.length} total application
              {applications.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="bg-navy text-white text-sm font-medium px-4 py-2.5 rounded-lg"
          >
            + Add application
          </button>
        </div>

        <div className="flex md:grid md:grid-cols-4 gap-3 mb-7 overflow-x-auto -mx-5 px-5 md:mx-0 md:px-0 md:overflow-visible">
          <div className="bg-surface border border-border rounded-[10px] px-4 py-3 shrink-0 min-w-[110px] md:min-w-0">
            <p className="text-xs text-text-muted mb-1">Applied</p>
            <p className="text-xl font-medium">{counts.applied}</p>
          </div>
          <div className="bg-surface border border-border rounded-[10px] px-4 py-3 shrink-0 min-w-[110px] md:min-w-0">
            <p className="text-xs text-text-muted mb-1">Screening</p>
            <p className="text-xl font-medium">{counts.oa}</p>
          </div>
          <div className="bg-surface border border-border rounded-[10px] px-4 py-3 shrink-0 min-w-[110px] md:min-w-0">
            <p className="text-xs text-text-muted mb-1">Interview</p>
            <p className="text-xl font-medium">{counts.interview}</p>
          </div>
          <div className="bg-surface border border-border rounded-[10px] px-4 py-3 shrink-0 min-w-[110px] md:min-w-0">
            <p className="text-xs text-text-muted mb-1">Offer</p>
            <p className="text-xl font-medium">{counts.offer}</p>
          </div>
        </div>

        <div className="flex gap-2 mb-4 overflow-x-auto -mx-5 px-5 md:mx-0 md:px-0">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`text-sm px-3 py-1.5 rounded-md border shrink-0 ${
                filter === f.value
                  ? "bg-surface border-border-strong font-medium"
                  : "border-transparent text-text-secondary"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading && (
          <p className="text-text-secondary text-sm py-8">Loading…</p>
        )}

        {error && <p className="text-rejected text-sm py-4">⚠ {error}</p>}

        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-text-secondary text-sm">
              {applications.length === 0
                ? "No applications yet. Add your first one to get started."
                : "No applications match this filter."}
            </p>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="flex flex-col gap-2">
            {filtered.map((app) => (
              <div
                key={app.id}
                onClick={() => setSelectedApp(app)}
                className="flex items-center gap-3 px-3.5 py-3 border border-border rounded-[10px] bg-surface cursor-pointer hover:border-border-strong"
              >
                <div className="w-[30px] h-[30px] rounded-[7px] bg-applied-bg text-applied flex items-center justify-center text-xs font-medium shrink-0">
                  {initials(app.company_name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {app.company_name}
                  </p>
                  <p className="text-xs text-text-muted truncate">
                    {app.role_title}
                  </p>
                </div>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full shrink-0 ${STATUS_STYLES[app.status]}`}
                >
                  {STATUS_LABELS[app.status]}
                </span>
                <span className="text-xs text-text-muted w-14 text-right shrink-0 hidden sm:inline">
                  {formatDate(app.applied_date)}
                </span>
              </div>
            ))}
          </div>
        )}

        <AddApplicationModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onCreated={(newApp) => setApplications((prev) => [newApp, ...prev])}
        />

        <ApplicationDetailModal
          application={selectedApp}
          onClose={() => setSelectedApp(null)}
          onUpdated={(updatedApp) =>
            setApplications((prev) =>
              prev.map((a) => (a.id === updatedApp.id ? updatedApp : a))
            )
          }
          onDeleted={(id) =>
            setApplications((prev) => prev.filter((a) => a.id !== id))
          }
        />
      </div>
      <MobileNav />
    </div>
  );
}