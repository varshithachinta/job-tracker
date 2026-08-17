"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutGrid, List, BarChart3, LogOut } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/applications", label: "All applications", icon: List },
  { href: "/insights", label: "Insights", icon: BarChart3 },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    localStorage.removeItem("token");
    router.push("/login");
  }

  return (
    <div className="hidden md:flex w-[220px] shrink-0 bg-navy text-[#EDEADF] p-5 flex-col min-h-screen">
      <div className="flex items-center gap-2 mb-8 px-1">
        <div className="w-[22px] h-[22px] rounded-md bg-brass shrink-0" />
        <span className="font-display text-base font-medium">Trackly</span>
      </div>

      <nav className="flex flex-col gap-0.5">
        {navItems.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 text-sm px-2.5 py-2 rounded-md ${
                active
                  ? "bg-white/[.08] text-white font-medium"
                  : "text-[#B8BCC7]"
              }`}
            >
              <Icon size={16} strokeWidth={2} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={handleLogout}
        className="mt-auto flex items-center gap-2.5 text-sm px-2.5 py-2 rounded-md text-[#B8BCC7] text-left"
      >
        <LogOut size={16} strokeWidth={2} />
        Logout
      </button>
    </div>
  );
}