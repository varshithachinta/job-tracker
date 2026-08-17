"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { Application, ApplicationStatus } from "@/lib/types";
import Sidebar from "@/components/Sidebar";
import AddApplicationModal from "@/components/AddApplicationModal";

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
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<ApplicationStatus | "all">("all");
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    loadApplications();
  }, []);

  async function loadApplications() {
    setLoading(true);
    setError("");
    try {
      const data = await api.get<Application[]>("/applications");
      setApplications(data);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }
      setError("Could not load applications. Please try again.");
    } finally {
      setLoading(false);
    }
  }

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
    <div className="flex min-h-screen bg-bg">
      <Sidebar />

      <div className="flex-1 p-9 min-w-0">
        <div className="flex items-baseline justify-between mb-7">
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

        <div className="grid grid-cols-4 gap-3 mb-7">
          <div className="bg-surface border border-border rounded-[10px] px-4 py-3">
            <p className="text-xs text-text-muted mb-1">Applied</p>
            <p className="text-xl font-medium">{counts.applied}</p>
          </div>
          <div className="bg-surface border border-border rounded-[10px] px-4 py-3">
            <p className="text-xs text-text-muted mb-1">Screening</p>
            <p className="text-xl font-medium">{counts.oa}</p>
          </div>
          <div className="bg-surface border border-border rounded-[10px] px-4 py-3">
            <p className="text-xs text-text-muted mb-1">Interview</p>
            <p className="text-xl font-medium">{counts.interview}</p>
          </div>
          <div className="bg-surface border border-border rounded-[10px] px-4 py-3">
            <p className="text-xs text-text-muted mb-1">Offer</p>
            <p className="text-xl font-medium">{counts.offer}</p>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
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

        {loading && (
          <p className="text-text-secondary text-sm py-8">Loading…</p>
        )}

        {error && (
          <p className="text-rejected text-sm py-4">⚠ {error}</p>
        )}

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
                className="flex items-center gap-3 px-3.5 py-3 border border-border rounded-[10px] bg-surface"
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
                <span className="text-xs text-text-muted w-14 text-right shrink-0">
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
      </div>
    </div>
  );
}