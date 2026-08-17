"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { Application } from "@/lib/types";

export function useApplications() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    load();
  }, []);

  async function load() {
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

  return { applications, setApplications, loading, error };
}