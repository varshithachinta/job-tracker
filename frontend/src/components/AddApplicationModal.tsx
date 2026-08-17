"use client";

import { useState } from "react";
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

export default function AddApplicationModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (app: Application) => void;
}) {
  const [companyName, setCompanyName] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [jobLink, setJobLink] = useState("");
  const [status, setStatus] = useState<ApplicationStatus>("applied");
  const [appliedDate, setAppliedDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function resetForm() {
    setCompanyName("");
    setRoleTitle("");
    setJobLink("");
    setStatus("applied");
    setAppliedDate(new Date().toISOString().slice(0, 10));
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const newApp = await api.post<Application>("/applications", {
        company_name: companyName,
        role_title: roleTitle,
        job_link: jobLink || null,
        status,
        applied_date: appliedDate || null,
      });
      onCreated(newApp);
      resetForm();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={() => { resetForm(); onClose(); }}>
      <h2 className="font-display text-xl font-medium mb-5">Add application</h2>

      <form onSubmit={handleSubmit}>
        <label className="text-xs font-medium block mb-1.5">Company</label>
        <input
          required
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="e.g. Microsoft"
          className="w-full px-3.5 py-2.5 border border-border-strong rounded-lg text-sm mb-3.5 bg-white"
        />

        <label className="text-xs font-medium block mb-1.5">Role</label>
        <input
          required
          value={roleTitle}
          onChange={(e) => setRoleTitle(e.target.value)}
          placeholder="e.g. Software Engineer"
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

        {error && <p className="text-rejected text-xs mb-3">⚠ {error}</p>}

        <div className="flex gap-2.5 mt-5">
          <button
            type="button"
            onClick={() => { resetForm(); onClose(); }}
            className="flex-1 border border-border-strong rounded-lg py-2.5 text-sm font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-navy text-white rounded-lg py-2.5 text-sm font-medium disabled:opacity-60"
          >
            {loading ? "Adding…" : "Add application"}
          </button>
        </div>
      </form>
    </Modal>
  );
}