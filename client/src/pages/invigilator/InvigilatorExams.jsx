import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import {
  Calendar,
  Clock,
  Building2,
  Search,
  ClipboardList,
  CheckCircle,
  AlertCircle,
  Filter
} from 'lucide-react';

const InvigilatorExams = () => {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

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
      addToast('Failed to load assigned examination duties', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filtered = assignments.filter((duty) => {
    const matchesSearch =
      duty.examTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      duty.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      duty.hallName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      duty.roomNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === 'ALL'
        ? true
        : filterStatus === 'SUBMITTED'
        ? duty.attendanceSubmitted
        : !duty.attendanceSubmitted;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 font-display">Assigned Invigilation Roster</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Comprehensive schedule of examinations and halls allocated for your invigilation duty.
        </p>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by exam, subject, hall, or room..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9.5 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div className="flex space-x-2">
          {['ALL', 'PENDING', 'SUBMITTED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterStatus === status
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {status === 'ALL' ? 'All Duties' : status === 'PENDING' ? 'Pending Attendance' : 'Submitted'}
            </button>
          ))}
        </div>
      </div>

      {/* Roster Cards */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No Matching Duties Found"
          message="No invigilation assignments matched your search criteria."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((duty) => (
            <div
              key={duty.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 text-slate-700">
                    ID #{duty.id}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      duty.attendanceSubmitted
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {duty.attendanceSubmitted ? 'Attendance Submitted' : 'Pending Attendance'}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 font-display leading-snug">
                    {duty.examTitle}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {duty.subjectName} ({duty.subjectCode})
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 space-y-2 text-xs">
                  <div className="flex items-center space-x-2 text-slate-900 font-bold">
                    <Building2 className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>{duty.hallName}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 text-[11px]">
                    <span>Room: <strong>{duty.roomNumber}</strong></span>
                    <span>Capacity: {duty.hallCapacity || 40} Seats</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-slate-600 text-[11px] pt-1.5 border-t border-slate-200">
                    <Clock className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>{duty.examDate} • {duty.startTime?.substring(0, 5)} - {duty.endTime?.substring(0, 5)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate(`/invigilator/attendance?examId=${duty.examId}&hallId=${duty.hallId}`)}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer transition-all"
              >
                <ClipboardList className="w-4 h-4 text-indigo-400" />
                <span>Open Seating & Attendance</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InvigilatorExams;
