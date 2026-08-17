"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/applications", label: "All applications" },
  { href: "/insights", label: "Insights" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    localStorage.removeItem("token");
    router.push("/login");
  }

  return (
    <div className="w-[220px] shrink-0 bg-navy text-[#EDEADF] p-5 flex flex-col min-h-screen">
      <div className="flex items-center gap-2 mb-8 px-1">
        <div className="w-[22px] h-[22px] rounded-md bg-brass shrink-0" />
        <span className="font-display text-base font-medium">Trackly</span>
      </div>

      <nav className="flex flex-col gap-0.5">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm px-2.5 py-2 rounded-md ${
                active
                  ? "bg-white/[.08] text-white font-medium"
                  : "text-[#B8BCC7]"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={handleLogout}
        className="mt-auto text-sm px-2.5 py-2 rounded-md text-[#B8BCC7] text-left"
      >
        Logout
      </button>
    </div>
  );
}