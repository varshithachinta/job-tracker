"use client";

import { useState } from "react";
import { useApplications } from "@/lib/useApplications";
import { ApplicationStatus } from "@/lib/types";
import Sidebar from "@/components/Sidebar";
import ApplicationDetailModal from "@/components/ApplicationDetailModal";
import { Application, ApplicationStatus } from "@/lib/types";

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

export default function AllApplicationsPage() {
  const { applications, setApplications, loading, error } = useApplications();
  const [filter, setFilter] = useState<ApplicationStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  const filtered = applications
    .filter((a) => filter === "all" || a.status === filter)
    .filter((a) => {
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return (
        a.company_name.toLowerCase().includes(q) ||
        a.role_title.toLowerCase().includes(q)
      );
    });

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar />

      <div className="flex-1 p-9 min-w-0">
        <div className="mb-6">
          <h1 className="font-display text-[26px] font-medium mb-1">
            All applications
          </h1>
          <p className="text-text-secondary text-sm">
            {applications.length} total
          </p>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search company or role…"
            className="flex-1 max-w-xs px-3.5 py-2 border border-border-strong rounded-lg text-sm bg-white"
          />
          <div className="flex gap-2">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`text-sm px-3 py-1.5 rounded-md border ${
                  filter === f.value
                    ? "bg-surface border-border-strong font-medium"
                    : "border-transparent text-text-secondary"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <p className="text-text-secondary text-sm py-8">Loading…</p>
        )}

        {error && <p className="text-rejected text-sm py-4">⚠ {error}</p>}

        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-text-secondary text-sm">
              {search
                ? `No applications match "${search}".`
                : "No applications match this filter."}
            </p>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="border border-border rounded-[10px] bg-surface overflow-hidden">
            {filtered.map((app, i) => (
              <div
                key={app.id}
                onClick={() => setSelectedApp(app)}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-bg/60 ${
                  i !== filtered.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <div className="w-[28px] h-[28px] rounded-[7px] bg-applied-bg text-applied flex items-center justify-center text-[11px] font-medium shrink-0">
                  {initials(app.company_name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {app.company_name}
                  </p>
                </div>
                <div className="w-[160px] shrink-0 text-sm text-text-secondary truncate">
                  {app.role_title}
                </div>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full shrink-0 w-[90px] text-center ${STATUS_STYLES[app.status]}`}
                >
                  {STATUS_LABELS[app.status]}
                </span>
                <span className="text-xs text-text-muted w-14 text-right shrink-0">
                  {formatDate(app.applied_date)}
                </span>
              </div>
            ))}
          </div>
        )}

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
    </div>
  );
}