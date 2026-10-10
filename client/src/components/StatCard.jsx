import React from 'react';

const StatCard = ({ title, value, subtitle, icon: Icon, color = 'indigo' }) => {
  const colorStyles = {
    indigo: {
      bg: 'bg-indigo-50/50',
      border: 'border-indigo-100',
      iconBg: 'bg-indigo-600',
      text: 'text-indigo-600',
    },
    emerald: {
      bg: 'bg-emerald-50/50',
      border: 'border-emerald-100',
      iconBg: 'bg-emerald-600',
      text: 'text-emerald-600',
    },
    amber: {
      bg: 'bg-amber-50/50',
      border: 'border-amber-100',
      iconBg: 'bg-amber-600',
      text: 'text-amber-600',
    },
    blue: {
      bg: 'bg-blue-50/50',
      border: 'border-blue-100',
      iconBg: 'bg-blue-600',
      text: 'text-blue-600',
    },
    rose: {
      bg: 'bg-rose-50/50',
      border: 'border-rose-100',
      iconBg: 'bg-rose-600',
      text: 'text-rose-600',
    },
    purple: {
      bg: 'bg-purple-50/50',
      border: 'border-purple-100',
      iconBg: 'bg-purple-600',
      text: 'text-purple-600',
    },
  }[color] || {
    bg: 'bg-indigo-50/50',
    border: 'border-indigo-100',
    iconBg: 'bg-indigo-600',
    text: 'text-indigo-600',
  };

  return (
    <div className={`p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 flex items-center justify-between`}>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">{title}</p>
        <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">{value}</h3>
        {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
      </div>
      {Icon && (
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm ${colorStyles.iconBg}`}>
          <Icon className="w-6 h-6" />
        </div>
      )}
    </div>
  );
};

export default StatCard;
