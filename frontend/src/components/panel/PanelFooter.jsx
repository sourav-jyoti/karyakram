import React from "react";

const PanelFooter = ({ onClose, onSubmit, submitting }) => {
  return (
    <div className="absolute bottom-0 left-0 right-0 px-10 py-6 bg-white border-t border-gray-200 flex items-center justify-between">
      <button
        type="button"
        onClick={onClose}
        className="text-[15px] font-bold text-[#1D2A4B] hover:text-calendlyBlue transition-colors"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={onSubmit}
        disabled={submitting}
        className="bg-calendlyBlue hover:bg-calendlyBlueHover text-white px-8 py-2.5 rounded-full text-[15px] font-semibold transition-colors shadow-sm disabled:opacity-60"
      >
        {submitting ? "Creating…" : "Create"}
      </button>
    </div>
  );
};

export default PanelFooter;
