import React from "react";
import EventCard from "./EventCard";

const EventCardList = ({ events = [], onDelete, emptyMessage }) => {
  if (!events.length) {
    return (
      <p className="mt-8 text-calendlyGrayText text-[15px]">
        {emptyMessage ?? "No event types yet."}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full pb-8 mt-6">
      {events.map((event) => (
        <EventCard key={event.id} event={event} onDelete={onDelete} />
      ))}
    </div>
  );
};

export default EventCardList;
