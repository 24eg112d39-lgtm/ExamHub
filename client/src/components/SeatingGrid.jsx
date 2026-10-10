import React, { useState } from 'react';
import { User, Check, X, AlertTriangle } from 'lucide-react';

const SeatingGrid = ({
  hall,
  allocations = [],
  attendances = [],
  onSeatClick,
  highlightRollNumber = null,
  interactiveAttendance = false,
  onMarkAttendance = null,
}) => {
  const [selectedSeat, setSelectedSeat] = useState(null);

  const totalRows = hall?.totalRows || 5;
  const totalColumns = hall?.totalColumns || 8;

  // Build lookup maps by seatNumber (e.g., "A1")
  const allocationMap = new Map();
  allocations.forEach((a) => {
    allocationMap.set(a.seatNumber, a);
  });

  const attendanceMap = new Map();
  attendances.forEach((att) => {
    attendanceMap.set(att.seatNumber, att);
  });

  const getDepartmentColor = (deptCode) => {
    switch (deptCode) {
      case 'CSE':
        return 'border-blue-400 bg-blue-50/70 text-blue-900';
      case 'ECE':
        return 'border-emerald-400 bg-emerald-50/70 text-emerald-900';
      case 'EEE':
        return 'border-amber-400 bg-amber-50/70 text-amber-900';
      case 'MECH':
        return 'border-purple-400 bg-purple-50/70 text-purple-900';
      case 'CIVIL':
        return 'border-rose-400 bg-rose-50/70 text-rose-900';
      default:
        return 'border-indigo-400 bg-indigo-50/70 text-indigo-900';
    }
  };

  const getAttendanceBadge = (status) => {
    if (!status) return null;
    switch (status) {
      case 'PRESENT':
        return (
          <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
            <Check className="w-2.5 h-2.5 mr-0.5" /> P
          </span>
        );
      case 'ABSENT':
        return (
          <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
            <X className="w-2.5 h-2.5 mr-0.5" /> A
          </span>
        );
      case 'MALPRACTICE':
        return (
          <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-purple-200 text-purple-900">
            <AlertTriangle className="w-2.5 h-2.5 mr-0.5" /> M
          </span>
        );
      default:
        return null;
    }
  };

  const handleSeatClick = (seatNumber, alloc, att) => {
    setSelectedSeat({ seatNumber, alloc, att });
    if (onSeatClick) {
      onSeatClick(seatNumber, alloc, att);
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      {/* Blackboard / Podium indicator */}
      <div className="w-full flex justify-center mb-2">
        <div className="w-48 py-1.5 bg-slate-800 text-slate-200 text-xs font-semibold rounded-lg text-center tracking-wider shadow-sm uppercase">
          Blackboard / Invigilator Podium
        </div>
      </div>

      {/* Grid container with horizontal scroll support */}
      <div className="overflow-x-auto pb-4">
        <div className="min-w-max mx-auto bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          {/* Column headers */}
          <div className="flex items-center mb-2">
            <div className="w-10 text-center font-bold text-xs text-slate-400">Row</div>
            <div className="flex space-x-2">
              {Array.from({ length: totalColumns }, (_, c) => (
                <div key={c + 1} className="w-24 text-center font-bold text-xs text-slate-400">
                  Col {c + 1}
                </div>
              ))}
            </div>
          </div>

          {/* Seat rows */}
          <div className="flex flex-col space-y-2">
            {Array.from({ length: totalRows }, (_, r) => {
              const rowChar = String.fromCharCode(65 + r);
              return (
                <div key={rowChar} className="flex items-center">
                  {/* Row Label */}
                  <div className="w-10 text-center font-extrabold text-sm text-slate-700">
                    {rowChar}
                  </div>

                  {/* Seat columns */}
                  <div className="flex space-x-2">
                    {Array.from({ length: totalColumns }, (_, c) => {
                      const colNum = c + 1;
                      const seatNumber = `${rowChar}${colNum}`;
                      const alloc = allocationMap.get(seatNumber);
                      const att = attendanceMap.get(seatNumber);

                      const isHighlighted = highlightRollNumber && alloc?.rollNumber === highlightRollNumber;
                      const isOccupied = !!alloc;

                      return (
                        <div
                          key={seatNumber}
                          onClick={() => handleSeatClick(seatNumber, alloc, att)}
                          className={`w-24 h-22 rounded-xl p-2 flex flex-col justify-between text-left transition-all duration-200 cursor-pointer border ${
                            isHighlighted
                              ? 'border-indigo-600 bg-indigo-50/90 ring-4 ring-indigo-400/40 shadow-md scale-105 z-10'
                              : isOccupied
                              ? `${getDepartmentColor(alloc.departmentCode)} hover:shadow-md hover:scale-102`
                              : 'border-slate-200 bg-slate-50/60 text-slate-400 hover:bg-slate-100/80 border-dashed'
                          }`}
                        >
                          {/* Seat header */}
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-xs">{seatNumber}</span>
                            {att && getAttendanceBadge(att.status)}
                          </div>

                          {/* Student Info if allocated */}
                          {isOccupied ? (
                            <div className="mt-1">
                              <p className="font-bold text-[11px] truncate leading-tight">
                                {alloc.studentName}
                              </p>
                              <div className="flex items-center justify-between text-[10px] text-slate-600 mt-1">
                                <span className="font-mono">{alloc.rollNumber}</span>
                                <span className="font-semibold px-1 rounded bg-white/70">
                                  {alloc.departmentCode}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center h-full text-[11px] font-medium text-slate-400">
                              Vacant
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected seat details card if interactive */}
      {selectedSeat?.alloc && (
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-extrabold text-sm">
              {selectedSeat.seatNumber}
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">{selectedSeat.alloc.studentName}</h4>
              <p className="text-xs text-slate-500 font-mono">
                {selectedSeat.alloc.rollNumber} | {selectedSeat.alloc.departmentName || selectedSeat.alloc.departmentCode} (Sec {selectedSeat.alloc.section})
              </p>
            </div>
          </div>

          {interactiveAttendance && onMarkAttendance && (
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-500 mr-1">Mark:</span>
              <button
                onClick={() => onMarkAttendance(selectedSeat.alloc.studentId, 'PRESENT')}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
              >
                Present
              </button>
              <button
                onClick={() => onMarkAttendance(selectedSeat.alloc.studentId, 'ABSENT')}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors"
              >
                Absent
              </button>
              <button
                onClick={() => onMarkAttendance(selectedSeat.alloc.studentId, 'MALPRACTICE')}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-xs transition-colors"
              >
                Malpractice
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SeatingGrid;
