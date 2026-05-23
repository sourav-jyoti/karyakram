import React from "react";
import EventCheckbox from "./EventCheckbox";
import EventDetails from "./EventDetails";
import EventActions from "./EventActions";

const EventCard = ({ event, onDelete }) => {
  return (
    <div className="relative w-full bg-white border border-gray-200 rounded-md shadow-sm flex items-center justify-between py-5 pr-5 hover:border-gray-300 transition-colors">
      <div
        className={`absolute left-0 top-0 bottom-0 w-1.5 ${event.color} rounded-l-md`}
      />
      <div className="flex items-start gap-4 pl-5 w-full">
        <EventCheckbox />
        <EventDetails event={event} />
      </div>
      <EventActions
        showExtraIcons={event.showExtraIcons}
        bookingUrl={event.bookingUrl}
        onDelete={onDelete ? () => onDelete(event.id) : undefined}
      />
    </div>
  );
};

export default EventCard;
