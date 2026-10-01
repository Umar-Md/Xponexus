"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { api } from "../../../lib/api";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();

    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await api.login({
        email: email.trim(),
        password,
      });

      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(err.message || "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#090b0d] text-white">
      {/* Background grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)
          `,
          backgroundSize: "52px 52px",
        }}
      />

      {/* Background glow */}
      <div className="pointer-events-none absolute -left-40 top-20 h-[420px] w-[420px] rounded-full bg-cyan-400/[0.05] blur-[120px]" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-[420px] w-[420px] rounded-full bg-blue-500/[0.05] blur-[120px]" />

      <div className="relative z-10 grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
        {/* LEFT */}
        <section className="hidden border-r border-white/[0.07] lg:flex lg:flex-col lg:justify-between lg:p-14 xl:p-20">
          <div>
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.05]">
                <span className="text-sm font-black">X</span>
              </div>

              <div>
                <p className="text-lg font-black tracking-[0.22em]">XPONEXUS</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-white/40">
                  Structural Design & Engineering
                </p>
              </div>
            </div>
          </div>

          <div className="max-w-xl">
            <div className="mb-7 flex items-center gap-3 text-xs uppercase tracking-[0.24em] text-white/40">
              <span className="h-px w-10 bg-white/30" />
              Administration
            </div>

            <h1 className="text-5xl font-medium leading-[1.08] tracking-[-0.04em] xl:text-6xl">
              Manage the work
              <span className="block text-white/35">behind the drawings.</span>
            </h1>

            <p className="mt-7 max-w-lg text-[15px] leading-7 text-white/45">
              Secure workspace for managing XPONEXUS projects, structural
              drawings, technical documents and portfolio content.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs text-white/30">
            <ShieldCheck size={15} />
            <span>Protected administrative access</span>
          </div>
        </section>

        {/* RIGHT */}
        <section className="flex min-h-screen items-center justify-center px-5 py-12 sm:px-8 lg:px-12">
          <div className="w-full max-w-[440px]">
            {/* Mobile logo */}
            <div className="mb-12 lg:hidden">
              <p className="text-xl font-black tracking-[0.22em]">XPONEXUS</p>
              <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-white/40">
                Structural Design & Engineering
              </p>
            </div>

            <div className="mb-9">
              <div className="mb-5 grid h-12 w-12 place-items-center rounded-xl border border-white/10 bg-white/[0.04]">
                <LockKeyhole size={20} strokeWidth={1.6} />
              </div>

              <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-white/35">
                Admin Portal
              </p>

              <h2 className="text-3xl font-semibold tracking-[-0.03em]">
                Welcome back
              </h2>

              <p className="mt-3 text-sm leading-6 text-white/40">
                Sign in to manage projects and engineering documentation.
              </p>
            </div>

            <form onSubmit={submit} className="space-y-5">
              {/* EMAIL */}
              <div>
                <label className="mb-2 block text-xs font-medium uppercase tracking-[0.12em] text-white/45">
                  Email address
                </label>

                <div className="group relative">
                  <Mail
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 transition group-focus-within:text-white/70"
                  />

                  <input
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="h-14 w-full rounded-xl border border-white/[0.09] bg-white/[0.035] pl-12 pr-4 text-sm text-white outline-none transition placeholder:text-white/20 hover:border-white/15 focus:border-white/30 focus:bg-white/[0.05]"
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div>
                <label className="mb-2 block text-xs font-medium uppercase tracking-[0.12em] text-white/45">
                  Password
                </label>

                <div className="group relative">
                  <LockKeyhole
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 transition group-focus-within:text-white/70"
                  />

                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="h-14 w-full rounded-xl border border-white/[0.09] bg-white/[0.035] pl-12 pr-12 text-sm text-white outline-none transition placeholder:text-white/20 hover:border-white/15 focus:border-white/30 focus:bg-white/[0.05]"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 transition hover:text-white"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              {/* ERROR */}
              {error && (
                <div className="rounded-xl border border-red-400/15 bg-red-400/[0.06] px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              {/* LOGIN */}
              <button
                type="submit"
                disabled={loading}
                className="group flex h-14 w-full items-center justify-between rounded-xl bg-white px-5 text-sm font-semibold text-[#0b0d0f] transition hover:bg-[#e9e9e9] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span>
                  {loading ? "Signing in..." : "Sign in to dashboard"}
                </span>

                <ArrowRight
                  size={18}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </button>
            </form>

            <div className="mt-8 border-t border-white/[0.07] pt-6">
              <div className="flex items-center gap-2 text-xs text-white/30">
                <ShieldCheck size={14} />
                Authorized personnel only
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
