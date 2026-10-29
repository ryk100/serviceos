"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Customers", href: "/dashboard/customers" },
  { label: "Vehicles", href: "/dashboard/vehicles" },
  { label: "Jobs", href: "/dashboard/jobs" },
  { label: "Calendar", href: "/dashboard/calendar" },
  { label: "Settings", href: "/dashboard/settings" },
];

export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {items.map((item) => {
        const active =
          item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={[
              "block rounded-lg px-3 py-2 text-sm transition-colors",
              active
                ? "bg-zinc-800 text-white"
                : "text-zinc-400 hover:bg-zinc-900 hover:text-white",
            ].join(" ")}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}