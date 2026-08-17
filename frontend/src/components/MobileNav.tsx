"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutGrid, List, BarChart3, LogOut } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Board", icon: LayoutGrid },
  { href: "/applications", label: "All", icon: List },
  { href: "/insights", label: "Insights", icon: BarChart3 },
];

export default function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    localStorage.removeItem("token");
    router.push("/login");
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 flex justify-around items-center py-2.5 border-t border-border bg-white z-40">
      {navItems.map((item) => {
        const active = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-0.5 text-[10px] ${
              active ? "text-navy font-semibold" : "text-text-muted"
            }`}
          >
            <Icon size={19} strokeWidth={active ? 2.3 : 2} />
            {item.label}
          </Link>
        );
      })}
      <button
        onClick={handleLogout}
        className="flex flex-col items-center gap-0.5 text-[10px] text-text-muted"
      >
        <LogOut size={19} strokeWidth={2} />
        Logout
      </button>
    </div>
  );
}