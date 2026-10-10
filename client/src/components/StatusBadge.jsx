import React from 'react';

const StatusBadge = ({ status }) => {
  if (!status) return null;

  const getStyle = () => {
    switch (status.toUpperCase()) {
      // Exam & Allocation status
      case 'PUBLISHED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/10';
      case 'ALLOCATION_GENERATED':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200 ring-indigo-500/10';
      case 'SCHEDULED':
        return 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-500/10';
      case 'ONGOING':
        return 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/10 animate-pulse';
      case 'COMPLETED':
        return 'bg-slate-100 text-slate-700 border-slate-200 ring-slate-500/10';
      case 'CANCELLED':
        return 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/10';
      case 'DRAFT':
        return 'bg-zinc-100 text-zinc-600 border-zinc-200 ring-zinc-500/10';

      // Attendance status
      case 'PRESENT':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/10';
      case 'ABSENT':
        return 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/10';
      case 'MALPRACTICE':
        return 'bg-purple-50 text-purple-700 border-purple-200 ring-purple-500/10 font-bold';
      case 'NOT_MARKED':
        return 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/10';

      // General
      case 'ACTIVE':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/10';
      case 'INACTIVE':
        return 'bg-slate-100 text-slate-600 border-slate-200 ring-slate-500/10';

      default:
        return 'bg-slate-50 text-slate-700 border-slate-200 ring-slate-500/10';
    }
  };

  const formatText = (text) => {
    return text.replace(/_/g, ' ');
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ring-1 ${getStyle()}`}
    >
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-current opacity-70"></span>
      {formatText(status)}
    </span>
  );
};

export default StatusBadge;
