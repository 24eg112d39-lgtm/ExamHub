import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import {
  Calendar,
  MapPin,
  Clock,
  Ticket,
  Printer,
  BookOpen,
  Award,
  AlertCircle,
  Building2,
  CheckCircle2,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [profile, setProfile] = useState(null);
  const [exams, setExams] = useState([]);
  const [allocations, setAllocations] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      // Fetch student profile
      const profRes = await api.get('/students/me');
      setProfile(profRes.data);

      if (profRes.data?.id) {
        // Fetch registered exams
        const examRes = await api.get(`/exams/student/${profRes.data.id}`);
        const examList = examRes.data || [];
        setExams(examList);

        // Fetch seat allocation for any published exams
        const allocMap = {};
        for (const ex of examList) {
          if (ex.seatingPublished) {
            try {
              const seatRes = await api.get(`/allocations/exam/${ex.id}/my-seat`);
              allocMap[ex.id] = seatRes.data;
            } catch (e) {
              // Not allocated or draft
            }
          }
        }
        setAllocations(allocMap);
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to load student exam dashboard', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Find nearest upcoming published exam
  const publishedExams = exams.filter((e) => e.seatingPublished && allocations[e.id]);
  const nearestAllocatedExam = publishedExams[0];
  const nearestAllocation = nearestAllocatedExam ? allocations[nearestAllocatedExam.id] : null;

  return (
    <div className="space-y-6">
      {/* Student Welcome Header */}
      <div className="bg-linear-to-r from-indigo-700 via-indigo-800 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-white/10 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/15 text-indigo-100 border border-white/20 uppercase tracking-wider">
                Student Examination Portal
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                Verified Candidate
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black font-display tracking-tight">
              Welcome, {profile?.fullName || user?.fullName}!
            </h1>
            <p className="text-sm text-indigo-100 max-w-xl">
              Access your official exam seat allocation, digital hall tickets, and real-time room assignments below.
            </p>
          </div>

          {/* Quick info chip */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 flex flex-wrap gap-4 text-xs">
            <div>
              <span className="text-indigo-200 block text-[10px] uppercase font-bold tracking-wider">ROLL NUMBER</span>
              <span className="font-mono font-bold text-white text-sm">{profile?.rollNumber || 'N/A'}</span>
            </div>
            <div className="border-l border-white/15 pl-4">
              <span className="text-indigo-200 block text-[10px] uppercase font-bold tracking-wider">DEPARTMENT</span>
              <span className="font-semibold text-white">{profile?.departmentName || profile?.departmentCode || 'N/A'}</span>
            </div>
            <div className="border-l border-white/15 pl-4">
              <span className="text-indigo-200 block text-[10px] uppercase font-bold tracking-wider">SEM / SEC</span>
              <span className="font-semibold text-white">Sem {profile?.semester || '—'} • Sec {profile?.section || '—'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Digital Hall Ticket (Printable) */}
      {nearestAllocatedExam && nearestAllocation ? (
        <div className="bg-white rounded-3xl border-2 border-indigo-200 shadow-lg overflow-hidden transition-all hover:border-indigo-300">
          <div className="bg-indigo-50/75 border-b border-indigo-100 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                <Ticket className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
                  Official Digital Hall Ticket
                </span>
                <h2 className="text-base font-black text-slate-900 font-display">
                  {nearestAllocatedExam.title}
                </h2>
              </div>
            </div>
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 shadow-xs flex items-center space-x-2 cursor-pointer self-start sm:self-auto"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Hall Ticket</span>
            </button>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Seat & Hall Spotlight */}
            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Seat Box */}
              <div className="bg-linear-to-br from-indigo-500 to-indigo-700 text-white p-5 rounded-2xl shadow-md flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-100">Assigned Seat</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white/20 text-white">
                    CONFIRMED
                  </span>
                </div>
                <div className="my-3">
                  <span className="text-4xl md:text-5xl font-black font-mono tracking-tight">
                    {nearestAllocation.seatNumber}
                  </span>
                  <p className="text-xs text-indigo-100 mt-1">
                    Row {nearestAllocation.rowNumber} • Column {nearestAllocation.columnNumber}
                  </p>
                </div>
                <div className="text-[11px] text-indigo-200 flex items-center space-x-1 border-t border-white/20 pt-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Verified Seat Reservation</span>
                </div>
              </div>

              {/* Hall Box */}
              <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Exam Hall</span>
                  <Building2 className="w-4 h-4 text-slate-400" />
                </div>
                <div className="my-3">
                  <span className="text-xl font-black text-slate-900 block font-display">
                    {nearestAllocation.hallName}
                  </span>
                  <div className="flex items-center space-x-1.5 text-xs text-slate-600 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>Room: <strong>{nearestAllocation.roomNumber}</strong> ({nearestAllocation.hallCode})</span>
                  </div>
                </div>
                <div className="text-[11px] text-slate-500 border-t border-slate-200 pt-2 flex items-center justify-between">
                  <span>Capacity: {nearestAllocation.hallCapacity || '40'} Seats</span>
                  <span className="text-indigo-600 font-bold">Standard Hall</span>
                </div>
              </div>
            </div>

            {/* Exam Timing & Guidelines */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col justify-between text-xs space-y-3">
              <div>
                <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider block mb-2">
                  Schedule Details
                </span>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-slate-700">
                    <Calendar className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span className="font-semibold">{nearestAllocatedExam.examDate}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-700">
                    <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>
                      {nearestAllocatedExam.startTime?.substring(0, 5)} - {nearestAllocatedExam.endTime?.substring(0, 5)} ({nearestAllocatedExam.durationMinutes} mins)
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-700">
                    <BookOpen className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span className="font-medium text-slate-800">
                      {nearestAllocatedExam.subjectName} ({nearestAllocatedExam.subjectCode})
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-3">
                <span className="text-[10px] font-bold text-amber-600 uppercase flex items-center space-x-1 mb-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>Important Instructions</span>
                </span>
                <ul className="text-[11px] text-slate-600 space-y-1 list-disc list-inside">
                  <li>Carry valid Institutional Photo ID Card</li>
                  <li>Occupy your seat 15 minutes before exam start</li>
                  <li>Mobile phones and smartwatches strictly prohibited</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-5 flex items-start space-x-3 text-amber-900 text-xs">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm text-amber-900">Seating Allocation Notice</h4>
            <p className="mt-0.5 text-amber-700">
              Exam hall and seat allocations are released once the Examination Controller officially publishes the seating plan. Registered examinations are listed below.
            </p>
          </div>
        </div>
      )}

      {/* Registered Examinations Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900 font-display">Registered Examinations</h2>
            <p className="text-xs text-slate-500">Upcoming papers and seat publication status.</p>
          </div>
          <Link
            to="/student/exams"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
          >
            <span>View All Papers</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {exams.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No Registered Examinations"
            message="You are not registered for any upcoming examinations at this time."
          />
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Subject / Course</th>
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4">Hall</th>
                    <th className="py-3 px-4">Seat</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {exams.map((ex) => {
                    const seat = allocations[ex.id];
                    return (
                      <tr key={ex.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-900 block">{ex.subjectName}</span>
                          <span className="text-[11px] text-slate-500 font-mono">
                            {ex.subjectCode} • {ex.examType}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap text-slate-700">
                          <div className="font-medium">{ex.examDate}</div>
                          <div className="text-[11px] text-slate-500">
                            {ex.startTime?.substring(0, 5)} - {ex.endTime?.substring(0, 5)}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {seat ? (
                            <div>
                              <span className="font-bold text-slate-900">{seat.hallName}</span>
                              <span className="text-[11px] text-slate-500 block">Room {seat.roomNumber}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Pending Release</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {seat ? (
                            <span className="px-3 py-1 rounded-lg text-xs font-mono font-black bg-indigo-50 text-indigo-700 border border-indigo-200">
                              {seat.seatNumber}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">—</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          {ex.seatingPublished ? (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Seat Published
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              Scheduled
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
