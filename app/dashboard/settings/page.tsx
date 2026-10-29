import { Suspense } from "react";
import SettingsContent from "@/components/settings/settings-content";

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-zinc-400">
          Loading settings...
        </div>
      }
    >
      <SettingsContent />
    </Suspense>
  );
}