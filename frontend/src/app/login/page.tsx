"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { login, ApiError } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { access_token } = await login(email, password);
      localStorage.setItem("token", access_token);
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex-1 flex min-h-screen">
      <div className="hidden md:flex md:w-[42%] bg-navy text-[#EDEADF] p-11 flex-col justify-between">
        <div />
        <h2 className="font-display text-3xl font-medium leading-tight max-w-[240px]">
          Track every application with clarity.
        </h2>
        <p className="text-sm text-[#9CA1AF]">Trackly — a quiet home for your job search.</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-10">
        <div className="w-full max-w-[340px]">
          <div className="flex items-center gap-2 mb-7">
            <div className="w-[22px] h-[22px] rounded-md bg-brass" />
            <span className="font-display text-base font-medium">Trackly</span>
          </div>

          <h1 className="font-display text-2xl font-medium mb-1.5">Welcome back</h1>
          <p className="text-text-secondary text-sm mb-6">
            Log in to keep track of your applications.
          </p>

          <form onSubmit={handleSubmit}>
            <label className="text-xs font-medium block mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="w-full px-3.5 py-2.5 border border-border-strong rounded-lg text-sm mb-4 bg-white"
            />

            <label className="text-xs font-medium block mb-1.5">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={`w-full px-3.5 py-2.5 border rounded-lg text-sm bg-white ${
                error ? "border-rejected mb-1" : "border-border-strong mb-4"
              }`}
            />
            {error && (
              <p className="text-rejected text-xs mb-3.5">⚠ {error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-navy text-white rounded-lg py-3 text-sm font-medium mb-4.5 disabled:opacity-60"
            >
              {loading ? "Logging in…" : "Log in"}
            </button>
          </form>

          <p className="text-xs text-text-secondary text-center">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-navy font-semibold">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}