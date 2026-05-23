import React from 'react';
import { Calendar, Mail, ArrowRightCircle, Globe2 } from 'lucide-react';

const ActionIcons = () => {
  return (
    <div className="flex items-center gap-4 text-calendlyGrayText px-2 mr-2">
      <button className="hover:text-calendlyText transition-colors"><Calendar size={20} strokeWidth={1.5} /></button>
      <button className="hover:text-calendlyText transition-colors"><Mail size={20} strokeWidth={1.5} /></button>
      <button className="hover:text-calendlyText transition-colors"><ArrowRightCircle size={20} strokeWidth={1.5} /></button>
      <button className="hover:text-calendlyText transition-colors"><Globe2 size={20} strokeWidth={1.5} /></button>
    </div>
  );
};

export default ActionIcons;
