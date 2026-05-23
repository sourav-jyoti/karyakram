import React from 'react';
import TabItem from './TabItem';

const PageTabs = () => {
  const tabs = [
    { label: 'Event types', active: true },
  ];

  return (
    <div className="flex items-center gap-6 border-b border-gray-200 w-full mt-6">
      {tabs.map((tab, index) => (
        <TabItem key={index} {...tab} />
      ))}
    </div>
  );
};

export default PageTabs;
