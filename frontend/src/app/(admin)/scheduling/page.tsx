import { Suspense } from "react";
import SchedulingView from "@/views/SchedulingView";

export default function SchedulingPage() {
  return (
    <Suspense fallback={<div className="p-8 text-calendlyGrayText">Loading scheduling…</div>}>
      <SchedulingView />
    </Suspense>
  );
}
