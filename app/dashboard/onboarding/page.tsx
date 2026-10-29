import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { connection } from "next/server";

export default async function OnboardingPage() {
  await connection();

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  async function createCompany(formData: FormData) {
    "use server";

    const name = formData.get("name") as string;

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/auth/login");
    }

    const { error } = await supabase.from("companies").insert({
      owner_id: user.id,
      name,
    });

    if (error) {
      throw new Error(error.message);
    }

    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white">
      <form
        action={createCompany}
        className="w-full max-w-md border border-zinc-800 rounded-xl p-8"
      >
        <h1 className="text-2xl font-semibold mb-2">
          Create your company
        </h1>

        <p className="text-zinc-400 mb-6">
          Set up your ServiceOS workspace.
        </p>

        <label className="block mb-2 text-sm">
          Company name
        </label>

        <input
          name="name"
          required
          placeholder="AutoShine Detailing"
          className="w-full rounded-md bg-zinc-900 border border-zinc-700 px-4 py-3 mb-6"
        />

        <button
          type="submit"
          className="w-full rounded-md bg-white text-black py-3 font-medium"
        >
          Continue
        </button>
      </form>
    </main>
  );
}