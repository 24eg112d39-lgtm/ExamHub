import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import {
  Calendar,
  Building2,
  Clock,
  ClipboardList,
  CheckCircle2,
  Users,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

const InvigilatorDashboard = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/invigilators/my-assignments');
      setAssignments(res.data || []);
    } catch (err) {
      console.error(err);
      addToast('Failed to load invigilation assignments', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const activeDuties = assignments.filter((a) => a.examStatus !== 'COMPLETED');
  const completedDuties = assignments.filter((a) => a.examStatus === 'COMPLETED');

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-linear-to-r from-slate-900 via-indigo-950 to-indigo-900 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/15 text-indigo-100 border border-white/20 uppercase tracking-wider">
                Invigilation & Hall Administration
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                Official Invigilator
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black font-display tracking-tight">
              Welcome, Prof. {user?.fullName}!
            </h1>
            <p className="text-sm text-indigo-100 max-w-xl">
              Manage examination hall attendance, verify candidate seat allocations, and finalize official attendance records.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex space-x-3 text-center">
            <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/15 min-w-[90px]">
              <span className="text-2xl font-black text-white block">{activeDuties.length}</span>
              <span className="text-[10px] text-indigo-200 font-bold uppercase">Active Duties</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/15 min-w-[90px]">
              <span className="text-2xl font-black text-emerald-300 block">{completedDuties.length}</span>
              <span className="text-[10px] text-indigo-200 font-bold uppercase">Completed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Assigned Exam Duties */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900 font-display">My Assigned Examination Duties</h2>
            <p className="text-xs text-slate-500">Live roster of exam halls under your invigilation.</p>
          </div>
          <Link
            to="/invigilator/exams"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
          >
            <span>View All Schedules</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {assignments.length === 0 ? (
          <EmptyState
            icon={UserCheck}
            title="No Assigned Invigilation Duties"
            message="You currently do not have any active invigilation assignments from the examination cell."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {assignments.map((duty) => (
              <div
                key={duty.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  {/* Status & Timing */}
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      Hall Duty
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      duty.attendanceSubmitted
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {duty.attendanceSubmitted ? 'Attendance Submitted' : 'Pending Attendance'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 font-display group-hover:text-indigo-600 transition-colors">
                      {duty.examTitle}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      {duty.subjectName} ({duty.subjectCode})
                    </p>
                  </div>

                  {/* Hall & Room Details */}
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-2 text-xs">
                    <div className="flex items-center space-x-2 text-slate-800 font-bold">
                      <Building2 className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>{duty.hallName}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600 text-[11px]">
                      <span>Room Number: <strong>{duty.roomNumber}</strong></span>
                      <span>Capacity: {duty.hallCapacity || '40'} Seats</span>
                    </div>
                    <div className="flex items-center space-x-1.5 text-slate-600 text-[11px] pt-1 border-t border-slate-200">
                      <Clock className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>{duty.examDate} • {duty.startTime?.substring(0, 5)} - {duty.endTime?.substring(0, 5)}</span>
                    </div>
                  </div>
                </div>

                {/* Action button */}
                <button
                  onClick={() => navigate(`/invigilator/attendance?examId=${duty.examId}&hallId=${duty.hallId}`)}
                  className="w-full py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer transition-all"
                >
                  <ClipboardList className="w-4 h-4" />
                  <span>Launch Hall Seating & Attendance</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Protocol Checklist Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center space-x-2.5">
          <ShieldCheck className="w-5 h-5 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            Examination Hall Protocol & Guidelines
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="font-bold text-slate-900 block">1. Physical Verification</span>
            <p>Verify each candidate's official Digital Hall Ticket and institutional photo ID card before allowing entry.</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="font-bold text-slate-900 block">2. Seating Plan Strictness</span>
            <p>Ensure candidates occupy precisely the assigned Row and Column seat number according to the system matrix.</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="font-bold text-slate-900 block">3. Final Attendance Seal</span>
            <p>Mark PRESENT, ABSENT, or MALPRACTICE on the interactive grid, then click "Submit Attendance" to freeze records.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvigilatorDashboard;
