import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import SubmitButton from "@/components/ui/submit-button";

export default async function CustomersPage() {

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

  const { data: customers, error } = await supabase
    .from("customers")
    .select("*")
    .eq("company_id", company.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  async function createCustomer(formData: FormData) {
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

    const { error } = await supabase.from("customers").insert({
      company_id: company.id,
      first_name: firstName,
      last_name: lastName,
      email: email || null,
      phone: phone || null,
      notes: notes || null,
    });

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath("/dashboard/customers");
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">Customers</h1>
        <p className="mt-2 text-zinc-400">
          Manage your customers and their contact information.
        </p>
      </div>

      <div className="grid gap-8 xl:grid-cols-[400px_1fr]">
        <div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
            <h2 className="text-lg font-semibold">Add customer</h2>

            <form action={createCustomer} className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm text-zinc-400">
                  First name
                </label>

                <input
                  type="text"
                  name="first_name"
                  required
                  placeholder="Martin"
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
                  placeholder="Novák"
                  className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2.5 outline-none focus:border-zinc-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-400">
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  placeholder="martin@example.com"
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
                  placeholder="+421 900 000 000"
                  className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2.5 outline-none focus:border-zinc-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-400">
                  Notes
                </label>

                <textarea
                  name="notes"
                  rows={4}
                  placeholder="Optional notes..."
                  className="w-full resize-none rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2.5 outline-none focus:border-zinc-500"
                />
              </div>

<SubmitButton
  pendingText="Adding customer..."
  className="w-full rounded-md bg-white px-4 py-2.5 font-medium text-black hover:bg-zinc-200"
>
  Add customer
</SubmitButton>
            </form>
          </div>
        </div>

        <div>
          <div className="overflow-hidden rounded-xl border border-zinc-800">
            <div className="border-b border-zinc-800 px-5 py-4">
              <h2 className="font-semibold">
                Customers
                <span className="ml-2 text-sm font-normal text-zinc-500">
                  {customers?.length ?? 0}
                </span>
              </h2>
            </div>

            {!customers || customers.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <p className="font-medium">No customers yet</p>
                <p className="mt-1 text-sm text-zinc-500">
                  Add your first customer using the form.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-800">
{customers.map((customer) => (
  <Link
    key={customer.id}
    href={`/dashboard/customers/${customer.id}`}
    className="flex items-center justify-between gap-6 px-5 py-4 transition-colors hover:bg-zinc-900/70"
  >
    <div className="min-w-0">
      <div className="font-medium">
        {customer.first_name} {customer.last_name}
      </div>

      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-500">
        {customer.email && <span>{customer.email}</span>}
        {customer.phone && <span>{customer.phone}</span>}
      </div>
    </div>

    <div className="shrink-0 text-sm text-zinc-600">
      Customer
    </div>
  </Link>
))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}