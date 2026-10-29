import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6">
        <header className="flex items-center justify-between py-6">
          <div className="text-xl font-semibold tracking-tight">
            ServiceOS
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="rounded-lg px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-900 hover:text-white"
            >
              Log in
            </Link>

            <Link
              href="/auth/sign-up"
              className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:bg-zinc-200"
            >
              Get started
            </Link>
          </div>
        </header>

        <section className="flex flex-1 items-center py-20">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-sm text-zinc-400">
              Business management for detailing shops
            </div>

            <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl">
              Run your detailing business from one place.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
              Manage customers, vehicles, jobs, schedules and revenue without
              spreadsheets or scattered notes.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/auth/sign-up"
                className="rounded-lg bg-white px-5 py-3 font-medium text-black hover:bg-zinc-200"
              >
                Start using ServiceOS
              </Link>

              <Link
                href="/auth/login"
                className="rounded-lg border border-zinc-800 px-5 py-3 font-medium text-zinc-200 hover:bg-zinc-900"
              >
                Log in
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-4 pb-20 md:grid-cols-3">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6">
            <h2 className="font-semibold">Customers & vehicles</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Keep customer details, vehicles and service history together.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6">
            <h2 className="font-semibold">Jobs & scheduling</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Create jobs, track their status and see scheduled work in one
              calendar.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6">
            <h2 className="font-semibold">Business overview</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Monitor open jobs, customers and monthly revenue from your
              dashboard.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}