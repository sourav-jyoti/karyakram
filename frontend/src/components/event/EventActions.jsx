import React from "react";
import CopyLinkButton from "./CopyLinkButton";
import MoreOptionsButton from "./MoreOptionsButton";

const EventActions = ({ showExtraIcons, bookingUrl, onDelete }) => {
  return (
    <div className="flex items-center gap-3 flex-shrink-0">
      {showExtraIcons}
      <CopyLinkButton bookingUrl={bookingUrl} />
      <MoreOptionsButton bookingUrl={bookingUrl} onDelete={onDelete} />
    </div>
  );
};

export default EventActions;
