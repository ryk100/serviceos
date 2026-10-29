import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { revalidatePath } from "next/cache";

export default async function CustomerDetailPage({
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

  const { data: customer } = await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .eq("company_id", company.id)
    .maybeSingle();

  if (!customer) {
    notFound();
  }

  const { data: vehicles, error: vehiclesError } = await supabase
  .from("vehicles")
  .select("*")
  .eq("customer_id", id)
  .eq("company_id", company.id)
  .order("created_at", { ascending: false });

if (vehiclesError) {
  throw new Error(vehiclesError.message);
}

async function createVehicle(formData: FormData) {
  "use server";

  const make = String(formData.get("make") || "").trim();
  const model = String(formData.get("model") || "").trim();
  const yearRaw = String(formData.get("year") || "").trim();
  const plate = String(formData.get("plate") || "").trim();
  const vin = String(formData.get("vin") || "").trim();
  const mileageRaw = String(formData.get("mileage") || "").trim();
  const color = String(formData.get("color") || "").trim();
  const notes = String(formData.get("vehicle_notes") || "").trim();

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

  const { error } = await supabase.from("vehicles").insert({
    company_id: company.id,
    customer_id: id,
    make,
    model,
    year: yearRaw ? Number(yearRaw) : null,
    plate: plate || null,
    vin: vin || null,
    mileage: mileageRaw ? Number(mileageRaw) : null,
    color: color || null,
    notes: notes || null,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/dashboard/customers/${id}`);
  revalidatePath("/dashboard/vehicles");
}

  async function updateCustomer(formData: FormData) {
    "use server";

    const firstName = String(formData.get("first_name") || "").trim();
    const lastName = String(formData.get("last_name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const notes = String(formData.get("notes") || "").trim();

    if (!firstName || !lastName) {
      throw new Error("First name and last name are required.");
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
      .from("customers")
      .update({
        first_name: firstName,
        last_name: lastName,
        email: email || null,
        phone: phone || null,
        notes: notes || null,
      })
      .eq("id", id)
      .eq("company_id", company.id);

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath(`/dashboard/customers/${id}`);
    revalidatePath("/dashboard/customers");
  }

  async function deleteCustomer() {
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
      .from("customers")
      .delete()
      .eq("id", id)
      .eq("company_id", company.id);

    if (error) {
      throw new Error(error.message);
    }

    redirect("/dashboard/customers");
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">
          {customer.first_name} {customer.last_name}
        </h1>

        <p className="mt-2 text-zinc-400">
          Customer details
        </p>
      </div>

      <div className="grid gap-8 xl:grid-cols-[1fr_320px]">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
          <h2 className="text-lg font-semibold">
            Edit customer
          </h2>

          <div className="mt-8 grid gap-8 xl:grid-cols-[420px_1fr]">
  <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
    <h2 className="text-lg font-semibold">Add vehicle</h2>

    <form action={createVehicle} className="mt-6 space-y-4">
      <div>
        <label className="mb-2 block text-sm text-zinc-400">
          Make
        </label>

        <input
          name="make"
          required
          placeholder="BMW"
          className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2.5 outline-none focus:border-zinc-500"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm text-zinc-400">
          Model
        </label>

        <input
          name="model"
          required
          placeholder="330d"
          className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2.5 outline-none focus:border-zinc-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-2 block text-sm text-zinc-400">
            Year
          </label>

          <input
            name="year"
            type="number"
            placeholder="2021"
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
            placeholder="85000"
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
          placeholder="NR-123AB"
          className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2.5"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm text-zinc-400">
          VIN
        </label>

        <input
          name="vin"
          placeholder="WBA..."
          className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2.5"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm text-zinc-400">
          Color
        </label>

        <input
          name="color"
          placeholder="Black"
          className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2.5"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm text-zinc-400">
          Notes
        </label>

        <textarea
          name="vehicle_notes"
          rows={3}
          placeholder="Optional notes..."
          className="w-full resize-none rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2.5"
        />
      </div>

      <button
        type="submit"
        className="w-full rounded-md bg-white px-4 py-2.5 font-medium text-black hover:bg-zinc-200"
      >
        Add vehicle
      </button>
    </form>
  </div>

  <div className="rounded-xl border border-zinc-800 overflow-hidden">
    <div className="border-b border-zinc-800 px-5 py-4">
      <h2 className="font-semibold">
        Vehicles
        <span className="ml-2 text-sm font-normal text-zinc-500">
          {vehicles?.length ?? 0}
        </span>
      </h2>
    </div>

    {!vehicles || vehicles.length === 0 ? (
      <div className="px-6 py-16 text-center">
        <p className="font-medium">No vehicles yet</p>
        <p className="mt-1 text-sm text-zinc-500">
          Add the customer's first vehicle.
        </p>
      </div>
    ) : (
      <div className="divide-y divide-zinc-800">
        {vehicles.map((vehicle) => (
          <div key={vehicle.id} className="px-5 py-4">
            <div className="font-medium">
              {vehicle.make} {vehicle.model}
            </div>

            <div className="mt-1 flex flex-wrap gap-x-4 text-sm text-zinc-500">
              {vehicle.year && <span>{vehicle.year}</span>}
              {vehicle.plate && <span>{vehicle.plate}</span>}
              {vehicle.mileage && (
                <span>{vehicle.mileage.toLocaleString()} km</span>
              )}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
</div>

          <form action={updateCustomer} className="mt-6 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-zinc-400">
                  First name
                </label>

                <input
                  type="text"
                  name="first_name"
                  required
                  defaultValue={customer.first_name}
                  className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2.5 outline-none focus:border-zinc-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-400">
                  Last name
                </label>

                <input
                  type="text"
                  name="last_name"
                  required
                  defaultValue={customer.last_name}
                  className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2.5 outline-none focus:border-zinc-500"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-400">
                Email
              </label>

              <input
                type="email"
                name="email"
                defaultValue={customer.email ?? ""}
                className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2.5 outline-none focus:border-zinc-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-400">
                Phone
              </label>

              <input
                type="tel"
                name="phone"
                defaultValue={customer.phone ?? ""}
                className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2.5 outline-none focus:border-zinc-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-400">
                Notes
              </label>

              <textarea
                name="notes"
                rows={5}
                defaultValue={customer.notes ?? ""}
                className="w-full resize-none rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2.5 outline-none focus:border-zinc-500"
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

        <div className="space-y-6">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
            <h2 className="font-semibold">Customer info</h2>

            <div className="mt-5 space-y-4 text-sm">
              <div>
                <div className="text-zinc-500">Email</div>
                <div className="mt-1">
                  {customer.email || "Not provided"}
                </div>
              </div>

              <div>
                <div className="text-zinc-500">Phone</div>
                <div className="mt-1">
                  {customer.phone || "Not provided"}
                </div>
              </div>

              <div>
                <div className="text-zinc-500">Created</div>
                <div className="mt-1">
                  {new Date(customer.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-red-950 bg-red-950/10 p-6">
            <h2 className="font-semibold text-red-400">
              Danger zone
            </h2>

            <p className="mt-2 text-sm text-zinc-500">
              Deleting a customer cannot be undone.
            </p>

            <form action={deleteCustomer} className="mt-5">
              <button
                type="submit"
                className="rounded-md border border-red-900 px-4 py-2 text-sm text-red-400 hover:bg-red-950/30"
              >
                Delete customer
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}