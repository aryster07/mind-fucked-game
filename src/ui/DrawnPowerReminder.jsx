// ============ DRAWN POWER REMINDER COMPONENT ============
// Shows a reminder when player draws a power card

import React from 'react';

const DrawnPowerReminder = ({ reminder }) => {
  if (!reminder || Date.now() >= reminder.expiresAt) return null;

  return (
    <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-40 bg-gradient-to-r from-amber-600 to-orange-600 px-5 py-3 rounded-xl shadow-lg border-2 border-amber-400 animate-bounce">
      <div className="flex items-center gap-3 text-white">
        <span className="text-3xl">{reminder.icon}</span>
        <div>
          <div className="font-bold text-sm">You drew a {reminder.cardRank}!</div>
          <div className="text-xs text-amber-100">
            Throw it later to use <span className="font-bold">{reminder.name}</span>!
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrawnPowerReminder;
