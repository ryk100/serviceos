import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { revalidatePath } from "next/cache";
import StatusBadge from "@/components/jobs/status-badge";

export default async function VehicleDetailPage({
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

  const { data: vehicle } = await supabase
    .from("vehicles")
    .select("*")
    .eq("id", id)
    .eq("company_id", company.id)
    .maybeSingle();

  if (!vehicle) {
    notFound();
  }

  const { data: customer } = await supabase
    .from("customers")
    .select("id, first_name, last_name, email, phone")
    .eq("id", vehicle.customer_id)
    .eq("company_id", company.id)
    .maybeSingle();

  const { data: jobs } = await supabase
    .from("jobs")
    .select("id, title, status, price, scheduled_at")
    .eq("vehicle_id", id)
    .eq("company_id", company.id)
    .order("created_at", { ascending: false });

  async function updateVehicle(formData: FormData) {
    "use server";

    const make = String(formData.get("make") || "").trim();
    const model = String(formData.get("model") || "").trim();
    const yearRaw = String(formData.get("year") || "").trim();
    const plate = String(formData.get("plate") || "").trim();
    const vin = String(formData.get("vin") || "").trim();
    const mileageRaw = String(formData.get("mileage") || "").trim();
    const color = String(formData.get("color") || "").trim();
    const notes = String(formData.get("notes") || "").trim();

    if (!make || !model) {
      throw new Error("Make and model are required.");
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

    const { error } = await supabase
      .from("vehicles")
      .update({
        make,
        model,
        year: yearRaw ? Number(yearRaw) : null,
        plate: plate || null,
        vin: vin || null,
        mileage: mileageRaw ? Number(mileageRaw) : null,
        color: color || null,
        notes: notes || null,
      })
      .eq("id", id)
      .eq("company_id", company.id);

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath(`/dashboard/vehicles/${id}`);
    revalidatePath("/dashboard/vehicles");
  }

  async function deleteVehicle() {
    "use server";

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

    const { error } = await supabase
      .from("vehicles")
      .delete()
      .eq("id", id)
      .eq("company_id", company.id);

    if (error) {
      throw new Error(error.message);
    }

    redirect("/dashboard/vehicles");
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">
          {vehicle.make} {vehicle.model}
        </h1>

        <p className="mt-2 text-zinc-400">
          Vehicle details and service history.
        </p>
      </div>

      <div className="grid gap-8 xl:grid-cols-[1fr_340px]">
        <div className="space-y-8">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
            <h2 className="text-lg font-semibold">
              Edit vehicle
            </h2>

            <form action={updateVehicle} className="mt-6 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-zinc-400">
                    Make
                  </label>

                  <input
                    name="make"
                    required
                    defaultValue={vehicle.make}
                    className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2.5"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-zinc-400">
                    Model
                  </label>

                  <input
                    name="model"
                    required
                    defaultValue={vehicle.model}
                    className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2.5"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-zinc-400">
                    Year
                  </label>

                  <input
                    name="year"
                    type="number"
                    defaultValue={vehicle.year ?? ""}
                    className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2.5"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-zinc-400">
                    Mileage
                  </label>

                  <input
                    name="mileage"
                    type="number"
                    defaultValue={vehicle.mileage ?? ""}
                    className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-400">
                  Plate
                </label>

                <input
                  name="plate"
                  defaultValue={vehicle.plate ?? ""}
                  className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2.5"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-400">
                  VIN
                </label>

                <input
                  name="vin"
                  defaultValue={vehicle.vin ?? ""}
                  className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2.5"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-400">
                  Color
                </label>

                <input
                  name="color"
                  defaultValue={vehicle.color ?? ""}
                  className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2.5"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-400">
                  Notes
                </label>

                <textarea
                  name="notes"
                  rows={4}
                  defaultValue={vehicle.notes ?? ""}
                  className="w-full resize-none rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2.5"
                />
              </div>

              <button
                type="submit"
                className="rounded-md bg-white px-5 py-2.5 font-medium text-black hover:bg-zinc-200"
              >
                Save changes
              </button>
            </form>
          </div>

          <div className="overflow-hidden rounded-xl border border-zinc-800">
            <div className="border-b border-zinc-800 px-5 py-4">
              <h2 className="font-semibold">
                Service history
                <span className="ml-2 text-sm font-normal text-zinc-500">
                  {jobs?.length ?? 0}
                </span>
              </h2>
            </div>

            {!jobs || jobs.length === 0 ? (
              <div className="px-6 py-12 text-center text-zinc-500">
                No jobs for this vehicle.
              </div>
            ) : (
              <div className="divide-y divide-zinc-800">
                {jobs.map((job) => (
                  <Link
                    key={job.id}
                    href={`/dashboard/jobs/${job.id}`}
                    className="flex items-center justify-between gap-6 px-5 py-4 hover:bg-zinc-900/70"
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

                      <div className="mt-1 text-xs uppercase text-zinc-500">
                        <StatusBadge status={job.status} />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
            <h2 className="font-semibold">Owner</h2>

            {customer ? (
              <div className="mt-5">
                <Link
                  href={`/dashboard/customers/${customer.id}`}
                  className="font-medium hover:underline"
                >
                  {customer.first_name} {customer.last_name}
                </Link>

                {customer.email && (
                  <div className="mt-2 text-sm text-zinc-500">
                    {customer.email}
                  </div>
                )}

                {customer.phone && (
                  <div className="mt-1 text-sm text-zinc-500">
                    {customer.phone}
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-5 text-zinc-500">
                Unknown customer
              </div>
            )}
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
            <h2 className="font-semibold">
              Vehicle info
            </h2>

            <div className="mt-5 space-y-4 text-sm">
              <div>
                <div className="text-zinc-500">Plate</div>
                <div className="mt-1">
                  {vehicle.plate || "Not provided"}
                </div>
              </div>

              <div>
                <div className="text-zinc-500">VIN</div>
                <div className="mt-1 break-all">
                  {vehicle.vin || "Not provided"}
                </div>
              </div>

              <div>
                <div className="text-zinc-500">Mileage</div>
                <div className="mt-1">
                  {vehicle.mileage !== null
                    ? `${Number(vehicle.mileage).toLocaleString()} km`
                    : "Not provided"}
                </div>
              </div>

              <div>
                <div className="text-zinc-500">Color</div>
                <div className="mt-1">
                  {vehicle.color || "Not provided"}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-red-950 bg-red-950/10 p-6">
            <h2 className="font-semibold text-red-400">
              Danger zone
            </h2>

            <p className="mt-2 text-sm text-zinc-500">
              Deleting this vehicle also deletes its jobs.
            </p>

            <form action={deleteVehicle} className="mt-5">
              <button
                type="submit"
                className="rounded-md border border-red-900 px-4 py-2 text-sm text-red-400 hover:bg-red-950/30"
              >
                Delete vehicle
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}