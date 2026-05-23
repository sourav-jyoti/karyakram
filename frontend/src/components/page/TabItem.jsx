import React from 'react';

const TabItem = ({ label, active }) => {
  return (
    <button
      className={`pb-3 text-[15px] transition-colors border-b-2 font-medium ${
        active
          ? 'text-calendlyText border-calendlyBlue'
          : 'text-calendlyGrayText border-transparent hover:text-calendlyText hover:border-gray-300'
      }`}
    >
      {label}
    </button>
  );
};

export default TabItem;
