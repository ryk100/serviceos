import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import SidebarNav from "@/components/dashboard/sidebar-nav";

export default async function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: company } = await supabase
    .from("companies")
    .select("id, name")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!company) {
    redirect("/onboarding");
  }

return (
  <div className="min-h-screen bg-zinc-950 text-white flex">
    <aside className="w-64 shrink-0 border-r border-zinc-800 bg-zinc-950 p-4">
      <div className="mb-8 px-2 pt-2">
        <div className="text-lg font-semibold tracking-tight">
          ServiceOS
        </div>

        <div className="mt-1 truncate text-sm text-zinc-500">
          {company.name}
        </div>
      </div>

      <SidebarNav />

    </aside>

    <main className="min-w-0 flex-1">
      {children}
    </main>
  </div>
);
}