// ============ COUNTDOWN COMPONENT ============
import React from 'react';

const Countdown = ({ seconds, message = 'Memorize your cards!' }) => {
  if (seconds === null) return null;

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 bg-black/80 px-8 py-4 rounded-2xl border-2 border-purple-500">
      <div className="text-white text-center">
        <div className="text-sm mb-1">{message}</div>
        <div className="text-5xl font-black text-purple-400">{seconds}</div>
      </div>
    </div>
  );
};

export default Countdown;
