import React from 'react';
import TopHeader from '../header/TopHeader';
import SchedulingView from '../../views/SchedulingView';
import MeetingsView from '../../views/MeetingsView';
import AvailabilityView from '../../views/AvailabilityView';

const MainContent = ({ currentView }) => {
  return (
    <div className="flex-1 flex flex-col bg-calendlyBg overflow-y-auto">
      <TopHeader />
      {currentView === 'Scheduling' && <SchedulingView />}
      {currentView === 'Meetings' && <MeetingsView />}
      {currentView === 'Availability' && <AvailabilityView />}
    </div>
  );
};

export default MainContent;
