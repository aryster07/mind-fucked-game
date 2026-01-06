// ============ NOTIFICATION BAR COMPONENT ============
import React from 'react';

const NotificationBar = ({ notification, children }) => {
  return (
    <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-30">
      <div className="bg-slate-800/90 px-4 py-2 rounded-lg text-white font-bold max-w-md">
        <div>{notification}</div>
        {children}
      </div>
    </div>
  );
};

export default NotificationBar;
