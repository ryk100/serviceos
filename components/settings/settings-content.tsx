import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { revalidatePath } from "next/cache";
import SubmitButton from "@/components/ui/submit-button";

export default async function SettingsPage() {
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
    .select("id, name, phone, email, address")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!company) {
    redirect("/onboarding");
  }

  async function updateCompany(formData: FormData) {
    "use server";

    const name = String(formData.get("name") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const address = String(formData.get("address") || "").trim();

    if (!name) {
      throw new Error("Company name is required.");
    }

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/auth/login");
    }

    const { error } = await supabase
      .from("companies")
      .update({
        name,
        phone: phone || null,
        email: email || null,
        address: address || null,
      })
      .eq("owner_id", user.id);

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath("/dashboard/settings");
    revalidatePath("/dashboard");
  }

  async function logout() {
    "use server";

    const supabase = await createClient();

    await supabase.auth.signOut();

    redirect("/auth/login");
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">Settings</h1>

        <p className="mt-2 text-zinc-400">
          Manage your company and account.
        </p>
      </div>

      <div className="max-w-3xl space-y-8">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
          <h2 className="text-lg font-semibold">
            Company settings
          </h2>

          <form action={updateCompany} className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-sm text-zinc-400">
                Company name
              </label>

              <input
                name="name"
                required
                defaultValue={company.name}
                className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2.5"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-400">
                Email
              </label>

              <input
                name="email"
                type="email"
                defaultValue={company.email ?? ""}
                placeholder="company@example.com"
                className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2.5"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-400">
                Phone
              </label>

              <input
                name="phone"
                type="tel"
                defaultValue={company.phone ?? ""}
                placeholder="+421 900 000 000"
                className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2.5"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-400">
                Address
              </label>

              <input
                name="address"
                defaultValue={company.address ?? ""}
                placeholder="Business address"
                className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2.5"
              />
            </div>

<SubmitButton
  pendingText="Saving..."
  className="rounded-md bg-white px-5 py-2.5 font-medium text-black hover:bg-zinc-200"
>
  Save changes
</SubmitButton>
          </form>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
          <h2 className="text-lg font-semibold">
            Account
          </h2>

          <div className="mt-4 text-sm text-zinc-500">
            Signed in as
          </div>

          <div className="mt-1">
            {user.email}
          </div>

          <form action={logout} className="mt-6">
            <button
              type="submit"
              className="rounded-md border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-900"
            >
              Log out
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}