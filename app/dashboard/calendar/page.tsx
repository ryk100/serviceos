import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import Link from "next/link";
import StatusBadge from "@/components/jobs/status-badge";

export default async function CalendarPage() {
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

  const { data: jobs, error } = await supabase
    .from("jobs")
    .select(`
      id,
      title,
      status,
      price,
      scheduled_at,
      customer_id,
      vehicle_id
    `)
    .eq("company_id", company.id)
    .not("scheduled_at", "is", null)
    .order("scheduled_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const { data: customers } = await supabase
    .from("customers")
    .select("id, first_name, last_name")
    .eq("company_id", company.id);

  const { data: vehicles } = await supabase
    .from("vehicles")
    .select("id, make, model, plate")
    .eq("company_id", company.id);

  const groupedJobs = new Map<string, typeof jobs>();

  for (const job of jobs ?? []) {
    if (!job.scheduled_at) continue;

    const dateKey = new Date(job.scheduled_at).toLocaleDateString();

    const existing = groupedJobs.get(dateKey) ?? [];
    existing.push(job);

    groupedJobs.set(dateKey, existing);
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">
          Calendar
        </h1>

        <p className="mt-2 text-zinc-400">
          Scheduled jobs and appointments.
        </p>
      </div>

      {!jobs || jobs.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 px-6 py-16 text-center">
          <p className="font-medium">
            No scheduled jobs
          </p>

          <p className="mt-1 text-sm text-zinc-500">
            Jobs with a scheduled date will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Array.from(groupedJobs.entries()).map(
            ([date, dayJobs]) => (
              <section key={date}>
                <div className="mb-3 text-sm font-medium text-zinc-400">
                  {date}
                </div>

                <div className="space-y-3">
                  {dayJobs?.map((job) => {
                    const customer = customers?.find(
                      (c) => c.id === job.customer_id
                    );

                    const vehicle = vehicles?.find(
                      (v) => v.id === job.vehicle_id
                    );

                    const jobDate = job.scheduled_at
                      ? new Date(job.scheduled_at)
                      : null;

                    return (
                      <Link
                        key={job.id}
                        href={`/dashboard/jobs/${job.id}`}
                        className="flex items-center justify-between gap-6 rounded-xl border border-zinc-800 bg-zinc-900/40 px-5 py-4 transition-colors hover:bg-zinc-900"
                      >
                        <div className="flex min-w-0 items-center gap-5">
                          <div className="w-16 shrink-0 text-lg font-semibold">
                            {jobDate
                              ? jobDate.toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "--:--"}
                          </div>

                          <div className="min-w-0">
                            <div className="font-medium">
                              {job.title}
                            </div>

                            <div className="mt-1 text-sm text-zinc-500">
                              {customer
                                ? `${customer.first_name} ${customer.last_name}`
                                : "Unknown customer"}

                              {vehicle
                                ? ` · ${vehicle.make} ${vehicle.model}`
                                : ""}
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0 text-right">
                          <div className="font-medium">
                            €{Number(job.price).toFixed(2)}
                          </div>

                          <div className="mt-1 text-xs uppercase text-zinc-500">
                            <StatusBadge status={job.status} />
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )
          )}
        </div>
      )}
    </div>
  );
}