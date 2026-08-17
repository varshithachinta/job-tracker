"use client";

import { useApplications } from "@/lib/useApplications";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";

const STATUS_BAR_COLORS: Record<string, string> = {
  applied: "bg-applied",
  screening: "bg-screening",
  interview: "bg-interview",
  offer: "bg-offer",
  rejected: "bg-rejected",
};

function getWeekLabel(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function startOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default function InsightsPage() {
  const { applications, loading, error } = useApplications();

  if (loading) {
    return (
      <div className="flex min-h-screen bg-bg pb-16 md:pb-0">
        <Sidebar />
        <div className="flex-1 p-5 md:p-9">
          <p className="text-text-secondary text-sm">Loading…</p>
        </div>
        <MobileNav />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-bg pb-16 md:pb-0">
        <Sidebar />
        <div className="flex-1 p-5 md:p-9">
          <p className="text-rejected text-sm">⚠ {error}</p>
        </div>
        <MobileNav />
      </div>
    );
  }

  const total = applications.length;

  const statusCounts = {
    applied: applications.filter((a) => a.status === "applied").length,
    oa: applications.filter((a) => a.status === "oa").length,
    interview: applications.filter((a) => a.status === "interview").length,
    offer: applications.filter((a) => a.status === "offer").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
  };

  const responded = total - statusCounts.applied;
  const responseRate = total > 0 ? Math.round((responded / total) * 100) : 0;

  const respondedApps = applications.filter(
    (a) => a.status !== "applied" && a.updated_at
  );
  const avgDays =
    respondedApps.length > 0
      ? (
          respondedApps.reduce((sum, a) => {
            const days =
              (new Date(a.updated_at!).getTime() -
                new Date(a.created_at).getTime()) /
              (1000 * 60 * 60 * 24);
            return sum + days;
          }, 0) / respondedApps.length
        ).toFixed(1)
      : "—";

  const funnel = [
    { label: "Applied", count: total, color: "applied" },
    {
      label: "Screening",
      count: statusCounts.oa + statusCounts.interview + statusCounts.offer,
      color: "screening",
    },
    {
      label: "Interview",
      count: statusCounts.interview + statusCounts.offer,
      color: "interview",
    },
    { label: "Offer", count: statusCounts.offer, color: "offer" },
  ];
  const maxFunnel = funnel[0].count || 1;

  const now = new Date();
  const weeks = Array.from({ length: 5 }, (_, i) => {
    const start = startOfWeek(now);
    start.setDate(start.getDate() - (4 - i) * 7);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    const count = applications.filter((a) => {
      if (!a.applied_date) return false;
      const d = new Date(a.applied_date);
      return d >= start && d < end;
    }).length;
    return { label: getWeekLabel(start), count };
  });
  const maxWeek = Math.max(...weeks.map((w) => w.count), 1);

  return (
    <div className="flex min-h-screen bg-bg pb-16 md:pb-0">
      <Sidebar />

      <div className="flex-1 p-5 md:p-9 min-w-0">
        <div className="mb-7">
          <h1 className="font-display text-xl md:text-[26px] font-medium mb-1">
            Insights
          </h1>
          <p className="text-text-secondary text-sm">
            Your job search, by the numbers
          </p>
        </div>

        {total === 0 ? (
          <p className="text-text-secondary text-sm py-8">
            Add a few applications to see insights here.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-surface border border-border rounded-xl p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary mb-4">
                  Overview
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-display text-4xl font-medium leading-none mb-1.5">
                      {responseRate}%
                    </p>
                    <p className="text-xs text-text-secondary">
                      Response rate
                    </p>
                  </div>
                  <div>
                    <p className="font-display text-4xl font-medium leading-none mb-1.5">
                      {avgDays}
                    </p>
                    <p className="text-xs text-text-secondary">
                      Avg. days to response
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-surface border border-border rounded-xl p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary mb-4">
                  Status breakdown
                </p>
                <div className="flex flex-col gap-2.5">
                  {(
                    [
                      ["applied", "Applied", statusCounts.applied],
                      ["screening", "Screening", statusCounts.oa],
                      ["interview", "Interview", statusCounts.interview],
                      ["offer", "Offer", statusCounts.offer],
                      ["rejected", "Rejected", statusCounts.rejected],
                    ] as [string, string, number][]
                  ).map(([key, label, count]) => {
                    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                    return (
                      <div key={key} className="flex items-center gap-2.5">
                        <span className="text-xs w-20 shrink-0">{label}</span>
                        <span className="flex-1 h-1.5 rounded bg-bg overflow-hidden">
                          <span
                            className={`block h-full rounded ${STATUS_BAR_COLORS[key]}`}
                            style={{ width: `${pct}%` }}
                          />
                        </span>
                        <span className="text-xs text-text-secondary w-9 text-right shrink-0">
                          {pct}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-surface border border-border rounded-xl p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary mb-4">
                  Applications per week
                </p>
                <div className="flex items-end gap-2.5 h-28 pt-2">
                  {weeks.map((w, i) => (
                    <div
                      key={i}
                      className="flex-1 flex flex-col items-center justify-end h-full"
                    >
                      <span className="text-xs text-text-secondary mb-1">
                        {w.count}
                      </span>
                      <div
                        className="w-full max-w-[26px] rounded-t bg-brass"
                        style={{
                          height: `${Math.max((w.count / maxWeek) * 100, 4)}%`,
                        }}
                      />
                      <span className="text-[10px] text-text-muted mt-2">
                        {w.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-surface border border-border rounded-xl p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary mb-4">
                  Pipeline funnel
                </p>
                <div className="flex flex-col gap-3">
                  {funnel.map((f) => (
                    <div key={f.label} className="flex items-center gap-3">
                      <span className="text-xs w-20 shrink-0">{f.label}</span>
                      <span className="flex-1 h-6 rounded bg-bg overflow-hidden">
                        <span
                          className={`h-full flex items-center px-2.5 text-xs font-semibold text-white rounded ${STATUS_BAR_COLORS[f.color]}`}
                          style={{
                            width: `${Math.max((f.count / maxFunnel) * 100, f.count > 0 ? 12 : 0)}%`,
                          }}
                        >
                          {f.count}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      <MobileNav />
    </div>
  );
}