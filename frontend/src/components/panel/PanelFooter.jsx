import React from "react";

const PanelFooter = ({ onMoreOptions, onSubmit, submitting, showMoreOptions = true }) => {
  return (
    <div className="absolute bottom-0 left-0 right-0 px-10 py-6 bg-white border-t border-gray-200 flex items-center justify-between">
      {showMoreOptions ? (
        <button
          type="button"
          onClick={onMoreOptions}
          className="text-[15px] font-bold text-[#1D2A4B] hover:text-calendlyBlue transition-colors"
        >
          More options
        </button>
      ) : (
        <div />
      )}
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
