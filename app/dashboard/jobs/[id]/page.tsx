import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { revalidatePath } from "next/cache";
import StatusBadge from "@/components/jobs/status-badge";

const statuses = [
  "booked",
  "arrived",
  "in_progress",
  "ready",
  "paid",
  "cancelled",
];

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();

  const { id } = await params;

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

  const { data: job, error } = await supabase
    .from("jobs")
    .select(`
      id,
      title,
      description,
      status,
      price,
      scheduled_at,
      completed_at,
      created_at,
      customer_id,
      vehicle_id
    `)
    .eq("id", id)
    .eq("company_id", company.id)
    .maybeSingle();

  if (error || !job) {
    notFound();
  }

  const { data: customer } = await supabase
    .from("customers")
    .select("id, first_name, last_name, email, phone")
    .eq("id", job.customer_id)
    .eq("company_id", company.id)
    .maybeSingle();

  const { data: vehicle } = await supabase
    .from("vehicles")
    .select("id, make, model, plate, year, mileage")
    .eq("id", job.vehicle_id)
    .eq("company_id", company.id)
    .maybeSingle();

  async function updateStatus(formData: FormData) {
    "use server";

    const status = String(formData.get("status") || "");

    if (!statuses.includes(status)) {
      throw new Error("Invalid status.");
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

    const updateData: {
      status: string;
      completed_at?: string | null;
    } = {
      status,
    };

    if (status === "paid") {
      updateData.completed_at = new Date().toISOString();
    } else {
      updateData.completed_at = null;
    }

    const { error } = await supabase
      .from("jobs")
      .update(updateData)
      .eq("id", id)
      .eq("company_id", company.id);

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath(`/dashboard/jobs/${id}`);
    revalidatePath("/dashboard/jobs");
    revalidatePath("/dashboard");
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">
          {job.title}
        </h1>

        <p className="mt-2 text-zinc-400">
          Job details
        </p>
      </div>

      <div className="grid gap-8 xl:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
            <h2 className="text-lg font-semibold">
              Job information
            </h2>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div>
                <div className="text-sm text-zinc-500">
                  Customer
                </div>
                <div className="mt-1">
                  {customer
                    ? `${customer.first_name} ${customer.last_name}`
                    : "Unknown"}
                </div>
              </div>

              <div>
                <div className="text-sm text-zinc-500">
                  Vehicle
                </div>
                <div className="mt-1">
                  {vehicle
                    ? `${vehicle.make} ${vehicle.model}`
                    : "Unknown"}
                </div>
              </div>

              <div>
                <div className="text-sm text-zinc-500">
                  Plate
                </div>
                <div className="mt-1">
                  {vehicle?.plate || "Not provided"}
                </div>
              </div>

              <div>
                <div className="text-sm text-zinc-500">
                  Price
                </div>
                <div className="mt-1 font-medium">
                  €{Number(job.price).toFixed(2)}
                </div>
              </div>

              <div>
                <div className="text-sm text-zinc-500">
                  Scheduled
                </div>
                <div className="mt-1">
                  {job.scheduled_at
                    ? new Date(job.scheduled_at).toLocaleString()
                    : "Not scheduled"}
                </div>
              </div>

              <div>
                <div className="text-sm text-zinc-500">
                  Created
                </div>
                <div className="mt-1">
                  {new Date(job.created_at).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <div className="text-sm text-zinc-500">
                Description
              </div>

              <div className="mt-2 whitespace-pre-wrap">
                {job.description || "No description"}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
            <h2 className="font-semibold">
              Status
            </h2>

            <form action={updateStatus} className="mt-5 space-y-4">
              <select
                name="status"
                defaultValue={job.status}
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

              <button
                type="submit"
                className="w-full rounded-md bg-white px-4 py-2.5 font-medium text-black hover:bg-zinc-200"
              >
                Update status
              </button>
            </form>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
            <h2 className="font-semibold">
              Workflow
            </h2>

            <div className="mt-5 space-y-3 text-sm">
              {statuses.map((status) => (
                <div
                  key={status}
                  className={
                    status === job.status
                      ? "rounded-md border border-zinc-600 bg-zinc-800 px-3 py-2 text-white"
                      : "rounded-md border border-zinc-800 px-3 py-2 text-zinc-500"
                  }
                >
                  <StatusBadge status={job.status} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}