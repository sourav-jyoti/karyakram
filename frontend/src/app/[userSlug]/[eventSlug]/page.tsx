import BookingView from "@/views/BookingView";

type Props = {
  params: Promise<{ userSlug: string; eventSlug: string }>;
};

export default async function PublicBookingPage({ params }: Props) {
  const { userSlug, eventSlug } = await params;
  return <BookingView userSlug={userSlug} eventSlug={eventSlug} />;
}
