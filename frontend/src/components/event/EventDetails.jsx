import React from 'react';
import EventTitle from './EventTitle';
import EventMeta from './EventMeta';
import EventSchedule from './EventSchedule';

const EventDetails = ({ event }) => {
  return (
    <div className="flex flex-col gap-0.5 w-full">
      <EventTitle title={event.title} />
      <EventMeta duration={event.duration} location={event.location} isLocationWarning={event.isLocationWarning} type={event.type} />
      <EventSchedule schedule={event.schedule} />
    </div>
  );
};

export default EventDetails;
