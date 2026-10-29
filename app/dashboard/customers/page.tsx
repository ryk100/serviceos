import { Suspense } from "react";
import CustomersContent from "@/components/customers/customers-content";

export default function CustomersPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-zinc-400">
          Loading customers...
        </div>
      }
    >
      <CustomersContent />
    </Suspense>
  );
}