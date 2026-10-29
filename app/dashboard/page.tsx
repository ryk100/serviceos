import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import StatusBadge from "@/components/jobs/status-badge";

export default async function DashboardPage() {
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
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!company) {
    redirect("/onboarding");
  }

  const now = new Date();

  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  const endOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1
  );

  const startOfMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    1
  );

  const { count: customersCount } = await supabase
    .from("customers")
    .select("*", { count: "exact", head: true })
    .eq("company_id", company.id);

  const { count: todaysJobsCount } = await supabase
    .from("jobs")
    .select("*", { count: "exact", head: true })
    .eq("company_id", company.id)
    .gte("scheduled_at", startOfToday.toISOString())
    .lt("scheduled_at", endOfToday.toISOString());

  const { count: openJobsCount } = await supabase
    .from("jobs")
    .select("*", { count: "exact", head: true })
    .eq("company_id", company.id)
    .not("status", "in", '("paid","cancelled")');

  const { data: paidJobs } = await supabase
    .from("jobs")
    .select("price")
    .eq("company_id", company.id)
    .eq("status", "paid")
    .gte("completed_at", startOfMonth.toISOString());

  const monthlyRevenue =
    paidJobs?.reduce(
      (total, job) => total + Number(job.price ?? 0),
      0
    ) ?? 0;

  const { data: recentJobs } = await supabase
    .from("jobs")
    .select(`
      id,
      title,
      status,
      price,
      scheduled_at
    `)
    .eq("company_id", company.id)
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">
          Dashboard
        </h1>

        <p className="mt-2 text-zinc-400">
          Overview of your business.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5 transition-colors hover:border-zinc-700">
          <div className="text-sm text-zinc-400">
            Today&apos;s jobs
          </div>

          <div className="mt-2 text-3xl font-semibold tracking-tight">
            {todaysJobsCount ?? 0}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5 transition-colors hover:border-zinc-700">
          <div className="text-sm text-zinc-400">
            Customers
          </div>

          <div className="mt-2 text-3xl font-semibold tracking-tight">
            {customersCount ?? 0}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5 transition-colors hover:border-zinc-700">
          <div className="text-sm text-zinc-400">
            Monthly revenue
          </div>

          <div className="mt-2 text-3xl font-semibold tracking-tight">
            €{monthlyRevenue.toFixed(2)}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5 transition-colors hover:border-zinc-700">
          <div className="text-sm text-zinc-400">
            Open jobs
          </div>

          <div className="mt-2 text-3xl font-semibold tracking-tight">
            {openJobsCount ?? 0}
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-zinc-800 overflow-hidden">
        <div className="border-b border-zinc-800 px-5 py-4">
          <h2 className="font-semibold">
            Recent jobs
          </h2>
        </div>

        {!recentJobs || recentJobs.length === 0 ? (
          <div className="px-6 py-12 text-center text-zinc-500">
            No jobs yet.
          </div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {recentJobs.map((job) => (
              <div
                key={job.id}
                className="flex items-center justify-between gap-6 px-5 py-4"
              >
                <div>
                  <div className="font-medium">
                    {job.title}
                  </div>

                  <div className="mt-1 text-sm text-zinc-500">
                    {job.scheduled_at
                      ? new Date(
                          job.scheduled_at
                        ).toLocaleString()
                      : "Not scheduled"}
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-medium">
                    €{Number(job.price).toFixed(2)}
                  </div>

<div className="mt-2">
  <StatusBadge status={job.status} />
</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}