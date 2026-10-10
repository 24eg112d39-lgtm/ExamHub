import React from 'react';

const LoadingSpinner = ({ label = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-10 h-10 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      {label && <p className="mt-3 text-sm text-slate-500 font-medium">{label}</p>}
    </div>
  );
};

export default LoadingSpinner;
