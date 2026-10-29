import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import SubmitButton from "@/components/ui/submit-button";

export default async function VehiclesPage() {
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

  const { data: vehicles, error } = await supabase
    .from("vehicles")
    .select(`
      id,
      customer_id,
      make,
      model,
      year,
      plate,
      vin,
      mileage,
      color,
      notes,
      created_at
    `)
    .eq("company_id", company.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const { data: customers } = await supabase
    .from("customers")
    .select("id, first_name, last_name")
    .eq("company_id", company.id);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">Vehicles</h1>

        <p className="mt-2 text-zinc-400">
          All vehicles registered in your business.
        </p>
      </div>

      <SubmitButton
  pendingText="Adding vehicle..."
  className="w-full rounded-md bg-white px-4 py-2.5 font-medium text-black hover:bg-zinc-200"
>
  Add vehicle
</SubmitButton>

      {!vehicles || vehicles.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 px-6 py-16 text-center">
          <p className="font-medium">No vehicles yet</p>

          <p className="mt-1 text-sm text-zinc-500">
            Add a vehicle from a customer profile.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-800">
          <div className="border-b border-zinc-800 px-5 py-4">
            <h2 className="font-semibold">
              Vehicles
              <span className="ml-2 text-sm font-normal text-zinc-500">
                {vehicles.length}
              </span>
            </h2>
          </div>

          

          <div className="divide-y divide-zinc-800">
            {vehicles.map((vehicle) => {
              const owner = customers?.find(
                (customer) => customer.id === vehicle.customer_id
              );

              return (
                <Link
                  key={vehicle.id}
                  href={`/dashboard/vehicles/${vehicle.id}`}
                  className="flex items-center justify-between gap-6 px-5 py-4 transition-colors hover:bg-zinc-900/70"
                >
                  <div className="min-w-0">
                    <div className="font-medium">
                      {vehicle.make} {vehicle.model}
                    </div>

                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-500">
                      {vehicle.year && <span>{vehicle.year}</span>}

                      {vehicle.plate && <span>{vehicle.plate}</span>}

                      {vehicle.mileage !== null && (
                        <span>
                          {Number(vehicle.mileage).toLocaleString()} km
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <div className="text-sm">
                      {owner
                        ? `${owner.first_name} ${owner.last_name}`
                        : "Unknown customer"}
                    </div>

                    <div className="mt-1 text-xs text-zinc-500">
                      Owner
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}