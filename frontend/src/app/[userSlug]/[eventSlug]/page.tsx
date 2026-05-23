import { Suspense } from "react";
import BookingView from "@/views/BookingView";

type Props = {
  params: Promise<{ userSlug: string; eventSlug: string }>;
};

export default async function PublicBookingPage({ params }: Props) {
  const { userSlug, eventSlug } = await params;
  
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-calendlyGrayText">Loading booking page…</div>}>
      <BookingView userSlug={userSlug} eventSlug={eventSlug} />
    </Suspense>
  );
}
