// ============ POWER TOAST COMPONENT ============
import React from 'react';

const PowerToast = ({ power, expiresAt }) => {
  if (!power || Date.now() >= expiresAt) return null;

  return (
    <div className="absolute top-20 right-4 z-50 bg-purple-600 px-4 py-3 rounded-lg shadow-lg">
      <div className="flex items-center gap-2 text-white">
        <span className="text-2xl">{power.icon}</span>
        <div>
          <div className="font-bold">{power.name}</div>
          <div className="text-xs text-purple-200">{power.desc}</div>
        </div>
      </div>
    </div>
  );
};

export default PowerToast;
