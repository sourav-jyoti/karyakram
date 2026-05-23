import React from 'react';

const MenuItem = ({ icon: Icon, label, subtext, onClick, href }) => {
  const baseClassName = "flex flex-col items-start px-4 py-2 hover:bg-gray-50 text-calendlyText text-left w-full transition-colors cursor-pointer";
  
  const content = (
    <>
      <div className="flex items-center gap-3 w-full">
        <Icon size={16} className="text-calendlyGrayText" /> 
        <span>{label}</span>
      </div>
      {subtext && (
        <span className="text-gray-500 pl-7 text-[13px] mt-0.5">{subtext}</span>
      )}
    </>
  );

  if (href) {
    return (
      <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer" 
        className={`${baseClassName} block`}
      >
        {content}
      </a>
    );
  }

  return (
    <button 
      type="button"
      onClick={onClick}
      className={baseClassName}
    >
      {content}
    </button>
  );
};

export default MenuItem;
