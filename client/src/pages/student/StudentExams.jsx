import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import {
  Calendar,
  Clock,
  MapPin,
  Building2,
  Ticket,
  Printer,
  FileText,
  Search,
  CheckCircle,
  AlertCircle,
  Award
} from 'lucide-react';

const StudentExams = () => {
  const { addToast } = useToast();
  const [profile, setProfile] = useState(null);
  const [exams, setExams] = useState([]);
  const [allocations, setAllocations] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const profRes = await api.get('/students/me');
      setProfile(profRes.data);

      if (profRes.data?.id) {
        const examRes = await api.get(`/exams/student/${profRes.data.id}`);
        const examList = examRes.data || [];
        setExams(examList);

        const allocMap = {};
        for (const ex of examList) {
          if (ex.seatingPublished) {
            try {
              const seatRes = await api.get(`/allocations/exam/${ex.id}/my-seat`);
              allocMap[ex.id] = seatRes.data;
            } catch (e) {
              // Not yet allocated
            }
          }
        }
        setAllocations(allocMap);
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to load examinations', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredExams = exams.filter((ex) => {
    const matchesSearch =
      ex.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ex.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ex.subjectCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filter === 'ALL'
        ? true
        : filter === 'PUBLISHED'
        ? ex.seatingPublished
        : !ex.seatingPublished;
    return matchesSearch && matchesFilter;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 font-display">My Examination Schedule</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Full timetable of registered examinations, room assignments, and hall tickets.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by subject, code, or paper name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9.5 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div className="flex space-x-2">
          {['ALL', 'PUBLISHED', 'SCHEDULED'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filter === f
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f === 'ALL' ? 'All Papers' : f === 'PUBLISHED' ? 'Seating Published' : 'Pending Seating'}
            </button>
          ))}
        </div>
      </div>

      {/* Exam Grid */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner />
        </div>
      ) : filteredExams.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No Examinations Found"
          message="No registered papers matched your query."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredExams.map((ex) => {
            const seat = allocations[ex.id];
            return (
              <div
                key={ex.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-100 text-slate-600">
                        {ex.subjectCode}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-1 font-display leading-snug">
                        {ex.subjectName}
                      </h3>
                      <p className="text-xs text-slate-500">{ex.title}</p>
                    </div>
                    {ex.seatingPublished ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
                        Seating Published
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap">
                        Scheduled
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50/75 p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center space-x-1.5">
                      <Calendar className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>{ex.examDate}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>{ex.startTime?.substring(0, 5)} - {ex.endTime?.substring(0, 5)}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Award className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>Max: {ex.totalMarks} | Pass: {ex.passingMarks}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <FileText className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>{ex.examType}</span>
                    </div>
                  </div>

                  {/* Seat Allocation Details */}
                  {seat ? (
                    <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
                          Assigned Hall & Room
                        </span>
                        <div className="flex items-center space-x-1 text-xs text-slate-800 font-bold mt-0.5">
                          <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                          <span>{seat.hallName} (Room {seat.roomNumber})</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Seat No
                        </span>
                        <span className="px-2.5 py-1 rounded-lg text-sm font-mono font-black bg-indigo-600 text-white shadow-xs inline-block mt-0.5">
                          {seat.seatNumber}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center text-xs text-slate-400 italic">
                      Hall and seat allocations will appear here when published.
                    </div>
                  )}
                </div>

                {seat && (
                  <button
                    onClick={() => setSelectedTicket({ exam: ex, seat })}
                    className="w-full py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
                  >
                    <Ticket className="w-3.5 h-3.5" />
                    <span>View Official Hall Ticket</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Hall Ticket Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 print:m-0 print:border-none print:shadow-none">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Ticket className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-black text-slate-900 font-display">Official Examination Hall Ticket</h3>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold print:hidden"
              >
                &times;
              </button>
            </div>

            {/* Hall Ticket Body */}
            <div className="border-2 border-dashed border-indigo-200 rounded-2xl p-5 bg-linear-to-b from-indigo-50/20 to-white space-y-4">
              <div className="flex justify-between items-start border-b border-slate-200 pb-3">
                <div>
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">EXAMHUB CENTRAL EXAMINATIONS</h4>
                  <p className="text-[11px] text-slate-500">Hall Ticket & Seat Verification Docket</p>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 uppercase">
                    ORIGINAL ADMIT PASS
                  </span>
                </div>
              </div>

              {/* Student details row */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-white p-3 rounded-xl border border-slate-100 shadow-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">CANDIDATE NAME</span>
                  <span className="font-bold text-slate-900">{profile?.fullName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">ROLL NUMBER</span>
                  <span className="font-mono font-bold text-indigo-600">{profile?.rollNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">DEPARTMENT / SEM</span>
                  <span className="font-medium text-slate-800">{profile?.departmentName} (Sem {profile?.semester})</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">REGISTRATION NO</span>
                  <span className="font-mono text-slate-700">{profile?.registrationNumber}</span>
                </div>
              </div>

              {/* Exam & Seat info */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-indigo-50/75 p-3 rounded-xl border border-indigo-100">
                <div>
                  <span className="text-[10px] text-indigo-600 font-bold uppercase block">PAPER / SUBJECT</span>
                  <span className="font-bold text-slate-900">{selectedTicket.exam.subjectName}</span>
                  <span className="text-[10px] text-slate-500 block">({selectedTicket.exam.subjectCode})</span>
                </div>
                <div>
                  <span className="text-[10px] text-indigo-600 font-bold uppercase block">DATE & TIME</span>
                  <span className="font-bold text-slate-900">{selectedTicket.exam.examDate}</span>
                  <span className="text-[10px] text-slate-600 block">
                    {selectedTicket.exam.startTime?.substring(0, 5)} - {selectedTicket.exam.endTime?.substring(0, 5)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-indigo-600 font-bold uppercase block">EXAM HALL</span>
                  <span className="font-bold text-slate-900">{selectedTicket.seat.hallName}</span>
                  <span className="text-[10px] text-slate-600 block">Room: {selectedTicket.seat.roomNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] text-indigo-600 font-bold uppercase block">ALLOCATED SEAT</span>
                  <span className="text-xl font-mono font-black text-indigo-700">{selectedTicket.seat.seatNumber}</span>
                  <span className="text-[10px] text-indigo-500 block">Row {selectedTicket.seat.rowNumber}, Col {selectedTicket.seat.columnNumber}</span>
                </div>
              </div>

              <div className="text-[10px] text-slate-500 border-t border-slate-200 pt-2 flex items-center justify-between">
                <span>Verification Code: {selectedTicket.seat.seatAllocationId || 'VERIFIED-EH-2026'}</span>
                <span>Controller of Examinations</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-2 pt-2 print:hidden">
              <button
                onClick={() => setSelectedTicket(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={handlePrint}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm flex items-center space-x-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Ticket</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentExams;
