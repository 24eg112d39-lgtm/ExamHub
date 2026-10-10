import React from 'react';
import { Inbox } from 'lucide-react';

const EmptyState = ({ title = 'No data available', message, icon: Icon = Inbox, action }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300">
      <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4 shadow-xs">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-base font-bold text-slate-800 mb-1">{title}</h3>
      {message && <p className="text-sm text-slate-500 max-w-sm mb-5 leading-relaxed">{message}</p>}
      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;
