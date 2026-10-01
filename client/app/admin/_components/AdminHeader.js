"use client";
import { Layers3, LogOut } from "lucide-react";

export default function AdminHeader({ onLogout }) {
  return (
    <header className="flex items-center justify-between border-b border-slate-200 pb-6">
      <div className="flex items-center gap-2.5">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-600 text-white shadow-sm"><Layers3 size={22} /></span>
        <div>
          <p className="text-[10px] font-bold tracking-widest text-indigo-600 uppercase">
            XPONEXUS
          </p>
          <p className="text-base font-semibold text-gray-900 leading-tight">
            Portfolio Admin
          </p>
        </div>
      </div>

      <button
        onClick={onLogout}
        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 focus-visible:outline-indigo-500"
      >
        <LogOut size={16} /> Sign out
      </button>
    </header>
  );
}
