"use client";
import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#080b0f]/90 backdrop-blur-xl">
      <div className="xpo-shell flex h-20 items-center justify-between">
        <Link href="/" className="text-xl font-black tracking-[.22em]">
          XPONEXUS
        </Link>
        <nav className="flex gap-6 text-sm text-slate-300">
          <a href="#work">Selected Work</a>
          <a href="#engineering">The Engineering</a>
          <Link href="/admin">Admin</Link>
        </nav>
      </div>
    </header>
  );
}
