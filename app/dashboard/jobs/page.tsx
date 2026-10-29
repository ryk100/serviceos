import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import SubmitButton from "@/components/ui/submit-button";
import StatusBadge from "@/components/jobs/status-badge";

export default async function JobsPage() {
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

  const { data: customers } = await supabase
    .from("customers")
    .select("id, first_name, last_name")
    .eq("company_id", company.id)
    .order("first_name");

  const { data: vehicles } = await supabase
    .from("vehicles")
    .select("id, customer_id, make, model, plate")
    .eq("company_id", company.id)
    .order("created_at", { ascending: false });

  const { data: jobs, error } = await supabase
    .from("jobs")
    .select(`
      id,
      title,
      description,
      status,
      price,
      scheduled_at,
      created_at,
      customer_id,
      vehicle_id
    `)
    .eq("company_id", company.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  async function createJob(formData: FormData) {
    "use server";

    const customerId = String(formData.get("customer_id") || "");
    const vehicleId = String(formData.get("vehicle_id") || "");
    const title = String(formData.get("title") || "").trim();
    const description = String(
      formData.get("description") || ""
    ).trim();

    const status = String(formData.get("status") || "booked");

    const priceRaw = String(formData.get("price") || "").trim();
    const scheduledAtRaw = String(
      formData.get("scheduled_at") || ""
    ).trim();

    if (!customerId || !vehicleId || !title) {
      throw new Error(
        "Customer, vehicle and job title are required."
      );
    }

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

    const { error } = await supabase.from("jobs").insert({
      company_id: company.id,
      customer_id: customerId,
      vehicle_id: vehicleId,
      title,
      description: description || null,
      status,
      price: priceRaw ? Number(priceRaw) : 0,
      scheduled_at: scheduledAtRaw
        ? new Date(scheduledAtRaw).toISOString()
        : null,
    });

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath("/dashboard/jobs");
    revalidatePath("/dashboard");
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">Jobs</h1>
        <p className="mt-2 text-zinc-400">
          Create and manage service jobs.
        </p>
      </div>

      <div className="grid gap-8 xl:grid-cols-[420px_1fr]">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
          <h2 className="text-lg font-semibold">
            Create job
          </h2>

          <form action={createJob} className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-sm text-zinc-400">
                Customer
              </label>

              <select
                name="customer_id"
                required
                className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2.5"
              >
                <option value="">Select customer</option>

                {customers?.map((customer) => (
                  <option
                    key={customer.id}
                    value={customer.id}
                  >
                    {customer.first_name}{" "}
                    {customer.last_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-400">
                Vehicle
              </label>

              <select
                name="vehicle_id"
                required
                className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2.5"
              >
                <option value="">Select vehicle</option>

                {vehicles?.map((vehicle) => (
                  <option
                    key={vehicle.id}
                    value={vehicle.id}
                  >
                    {vehicle.make} {vehicle.model}
                    {vehicle.plate
                      ? ` — ${vehicle.plate}`
                      : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-400">
                Job title
              </label>

              <input
                name="title"
                required
                placeholder="Interior detailing"
                className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2.5"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-400">
                Description
              </label>

              <textarea
                name="description"
                rows={4}
                placeholder="Job details..."
                className="w-full resize-none rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2.5"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-400">
                Status
              </label>

              <select
                name="status"
                defaultValue="booked"
                className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2.5"
              >
                <option value="booked">Booked</option>
                <option value="arrived">Arrived</option>
                <option value="in_progress">
                  In progress
                </option>
                <option value="ready">Ready</option>
                <option value="paid">Paid</option>
                <option value="cancelled">
                  Cancelled
                </option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-400">
                Price (€)
              </label>

              <input
                name="price"
                type="number"
                min="0"
                step="0.01"
                placeholder="80"
                className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2.5"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-400">
                Scheduled date
              </label>

              <input
                name="scheduled_at"
                type="datetime-local"
                className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2.5"
              />
            </div>

<SubmitButton
  pendingText="Creating job..."
  className="w-full rounded-md bg-white px-4 py-2.5 font-medium text-black hover:bg-zinc-200"
>
  Create job
</SubmitButton>
          </form>
        </div>

        <div className="overflow-hidden rounded-xl border border-zinc-800">
          <div className="border-b border-zinc-800 px-5 py-4">
            <h2 className="font-semibold">
              Jobs
              <span className="ml-2 text-sm font-normal text-zinc-500">
                {jobs?.length ?? 0}
              </span>
            </h2>
          </div>

          {!jobs || jobs.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="font-medium">No jobs yet</p>
              <p className="mt-1 text-sm text-zinc-500">
                Create your first service job.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800">
              {jobs.map((job) => {
                const customer = customers?.find(
                  (c) => c.id === job.customer_id
                );

                const vehicle = vehicles?.find(
                  (v) => v.id === job.vehicle_id
                );

                return (
                  <Link
  key={job.id}
  href={`/dashboard/jobs/${job.id}`}
  className="block px-5 py-4 transition-colors hover:bg-zinc-900/70"
>
                    <div className="flex items-start justify-between gap-6">
                      <div>
                        <div className="font-medium">
                          {job.title}
                        </div>

                        <div className="mt-1 text-sm text-zinc-500">
                          {customer
                            ? `${customer.first_name} ${customer.last_name}`
                            : "Unknown customer"}

                          {vehicle &&
                            ` · ${vehicle.make} ${vehicle.model}`}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-medium">
                          €{Number(job.price).toFixed(2)}
                        </div>

                        <div className="mt-1 text-xs uppercase text-zinc-500">
                          <StatusBadge status={job.status} />
                        </div>
                      </div>
                    </div>

                    {job.scheduled_at && (
                      <div className="mt-3 text-sm text-zinc-500">
                        {new Date(
                          job.scheduled_at
                        ).toLocaleString()}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}