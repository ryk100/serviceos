import { Suspense } from "react";
import DashboardShell from "@/components/dashboard/dashboard-shell";

export const metadata = {
  title: "ServiceOS",
  description:
    "Business management software for detailing shops and service businesses.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
          Loading ServiceOS...
        </div>
      }
    >
      <DashboardShell>{children}</DashboardShell>
    </Suspense>
  );
}