"use client";

import { useFormStatus } from "react-dom";

export default function SubmitButton({
  children,
  pendingText = "Saving...",
  className = "",
}: {
  children: React.ReactNode;
  pendingText?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={[
        className,
        pending ? "cursor-not-allowed opacity-60" : "",
      ].join(" ")}
    >
      {pending ? pendingText : children}
    </button>
  );
}