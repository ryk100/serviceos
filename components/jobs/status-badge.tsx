const styles: Record<string, string> = {
  booked: "border-blue-900 bg-blue-950/40 text-blue-300",
  arrived: "border-violet-900 bg-violet-950/40 text-violet-300",
  in_progress: "border-amber-900 bg-amber-950/40 text-amber-300",
  ready: "border-cyan-900 bg-cyan-950/40 text-cyan-300",
  paid: "border-emerald-900 bg-emerald-950/40 text-emerald-300",
  cancelled: "border-red-900 bg-red-950/40 text-red-300",
};

export default function StatusBadge({
  status,
}: {
  status: string;
}) {
  return (
    <span
      className={[
        "inline-flex rounded-full border px-2.5 py-1 text-xs font-medium capitalize",
        styles[status] ??
          "border-zinc-700 bg-zinc-900 text-zinc-300",
      ].join(" ")}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
}