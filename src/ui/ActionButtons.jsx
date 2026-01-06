// ============ ACTION BUTTONS COMPONENT ============
import React from 'react';

const ActionButtons = ({ canShow, canDone, onCallShow, onDone }) => {
  if (!canShow && !canDone) return null;

  return (
    <div className="absolute top-0 right-0 p-4 flex gap-2 z-30">
      {canShow && (
        <button
          onClick={onCallShow}
          className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-white font-bold shadow-lg transition-all"
        >
          🎯 CALL SHOW
        </button>
      )}
      {canDone && (
        <button
          onClick={onDone}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-bold animate-pulse shadow-lg"
        >
          ✅ Done
        </button>
      )}
    </div>
  );
};

export default ActionButtons;
