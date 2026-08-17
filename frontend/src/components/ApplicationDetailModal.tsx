"use client";

import { useState, useEffect } from "react";
import { api, ApiError } from "@/lib/api";
import { Application, ApplicationStatus } from "@/lib/types";
import Modal from "@/components/Modal";

const STATUS_OPTIONS: { value: ApplicationStatus; label: string }[] = [
  { value: "applied", label: "Applied" },
  { value: "oa", label: "Screening" },
  { value: "interview", label: "Interview" },
  { value: "offer", label: "Offer" },
  { value: "rejected", label: "Rejected" },
];

export default function ApplicationDetailModal({
  application,
  onClose,
  onUpdated,
  onDeleted,
}: {
  application: Application | null;
  onClose: () => void;
  onUpdated: (app: Application) => void;
  onDeleted: (id: number) => void;
}) {
  const [companyName, setCompanyName] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [jobLink, setJobLink] = useState("");
  const [status, setStatus] = useState<ApplicationStatus>("applied");
  const [appliedDate, setAppliedDate] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    if (application) {
      setCompanyName(application.company_name);
      setRoleTitle(application.role_title);
      setJobLink(application.job_link || "");
      setStatus(application.status);
      setAppliedDate(application.applied_date || "");
      setError("");
      setConfirmingDelete(false);
    }
  }, [application]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!application) return;
    setError("");
    setLoading(true);

    try {
      const updated = await api.put<Application>(
        `/applications/${application.id}`,
        {
          company_name: companyName,
          role_title: roleTitle,
          job_link: jobLink || null,
          status,
          applied_date: appliedDate || null,
        }
      );
      onUpdated(updated);
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!application) return;
    setLoading(true);
    try {
      await api.delete(`/applications/${application.id}`);
      onDeleted(application.id);
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not delete.");
      setLoading(false);
    }
  }

  return (
    <Modal open={!!application} onClose={onClose}>
      {confirmingDelete ? (
        <div>
          <h2 className="font-display text-xl font-medium mb-2">
            Delete this application?
          </h2>
          <p className="text-text-secondary text-sm mb-6">
            This can&apos;t be undone. {application?.company_name} —{" "}
            {application?.role_title} will be permanently removed.
          </p>
          {error && <p className="text-rejected text-xs mb-3">⚠ {error}</p>}
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={() => setConfirmingDelete(false)}
              className="flex-1 border border-border-strong rounded-lg py-2.5 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="flex-1 bg-rejected text-white rounded-lg py-2.5 text-sm font-medium disabled:opacity-60"
            >
              {loading ? "Deleting…" : "Delete"}
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSave}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-xl font-medium">Edit application</h2>
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              className="text-rejected text-xs font-medium"
            >
              Delete
            </button>
          </div>

          <label className="text-xs font-medium block mb-1.5">Company</label>
          <input
            required
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full px-3.5 py-2.5 border border-border-strong rounded-lg text-sm mb-3.5 bg-white"
          />

          <label className="text-xs font-medium block mb-1.5">Role</label>
          <input
            required
            value={roleTitle}
            onChange={(e) => setRoleTitle(e.target.value)}
            className="w-full px-3.5 py-2.5 border border-border-strong rounded-lg text-sm mb-3.5 bg-white"
          />

          <label className="text-xs font-medium block mb-1.5">Job link</label>
          <input
            type="url"
            value={jobLink}
            onChange={(e) => setJobLink(e.target.value)}
            placeholder="https://…"
            className="w-full px-3.5 py-2.5 border border-border-strong rounded-lg text-sm mb-3.5 bg-white"
          />

          <div className="flex gap-3 mb-3.5">
            <div className="flex-1">
              <label className="text-xs font-medium block mb-1.5">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
                className="w-full px-3.5 py-2.5 border border-border-strong rounded-lg text-sm bg-white"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium block mb-1.5">Applied date</label>
              <input
                type="date"
                value={appliedDate}
                onChange={(e) => setAppliedDate(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-border-strong rounded-lg text-sm bg-white"
              />
            </div>
          </div>

          {application?.updated_at && (
            <p className="text-xs text-text-muted mb-3.5">
              Last updated{" "}
              {new Date(application.updated_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </p>
          )}

          {error && <p className="text-rejected text-xs mb-3">⚠ {error}</p>}

          <div className="flex gap-2.5 mt-5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-border-strong rounded-lg py-2.5 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-navy text-white rounded-lg py-2.5 text-sm font-medium disabled:opacity-60"
            >
              {loading ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}