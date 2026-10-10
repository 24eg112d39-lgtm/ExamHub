import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import SeatingGrid from '../../components/SeatingGrid';
import Modal from '../../components/Modal';
import EmptyState from '../../components/EmptyState';
import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Building2,
  Users,
  Check,
  Send,
  RefreshCw,
  Clock,
  Printer,
  ChevronDown
} from 'lucide-react';

const InvigilatorAttendance = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [assignments, setAssignments] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState(searchParams.get('examId') || '');
  const [selectedHallId, setSelectedHallId] = useState(searchParams.get('hallId') || '');

  const [hall, setHall] = useState(null);
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Malpractice incident modal state
  const [malpracticeModal, setMalpracticeModal] = useState({
    open: false,
    studentId: null,
    studentName: '',
    seatNumber: '',
    remarks: ''
  });

  // Load invigilator duties to populate dropdown
  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const res = await api.get('/invigilators/my-assignments');
      const list = res.data || [];
      setAssignments(list);

      // If no query params, default to first duty
      if (!selectedExamId && !selectedHallId && list.length > 0) {
        setSelectedExamId(String(list[0].examId));
        setSelectedHallId(String(list[0].hallId));
        setSearchParams({ examId: list[0].examId, hallId: list[0].hallId });
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (selectedExamId && selectedHallId) {
      fetchAttendanceData();
    }
  }, [selectedExamId, selectedHallId]);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      // Fetch hall info
      const hallRes = await api.get(`/halls/${selectedHallId}`);
      setHall(hallRes.data);

      // Fetch attendance & seating records
      const recRes = await api.get(`/attendance/exam/${selectedExamId}/hall/${selectedHallId}`);
      setRecords(recRes.data || []);

      // Fetch summary stats
      const sumRes = await api.get(`/attendance/summary/exam/${selectedExamId}/hall/${selectedHallId}`);
      setSummary(sumRes.data);
    } catch (err) {
      console.error(err);
      addToast('Failed to load hall seating and attendance records', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDutyChange = (examId, hallId) => {
    setSelectedExamId(String(examId));
    setSelectedHallId(String(hallId));
    setSearchParams({ examId, hallId });
  };

  const handleMarkAttendance = async (studentId, status, remarks = null) => {
    if (status === 'MALPRACTICE' && !remarks) {
      const targetRecord = records.find((r) => r.studentId === studentId);
      setMalpracticeModal({
        open: true,
        studentId,
        studentName: targetRecord?.studentName || 'Student',
        seatNumber: targetRecord?.seatNumber || '',
        remarks: ''
      });
      return;
    }

    try {
      await api.post('/attendance/mark', {
        examId: Number(selectedExamId),
        studentId,
        status,
        remarks: remarks || ''
      });

      addToast(`Marked ${status}`, 'success');
      fetchAttendanceData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to record attendance';
      addToast(msg, 'error');
    }
  };

  const handleConfirmMalpractice = async (e) => {
    e.preventDefault();
    try {
      await api.post('/attendance/mark', {
        examId: Number(selectedExamId),
        studentId: malpracticeModal.studentId,
        status: 'MALPRACTICE',
        remarks: malpracticeModal.remarks || 'Malpractice incident reported'
      });
      addToast('Malpractice incident recorded', 'warning');
      setMalpracticeModal({ open: false, studentId: null, studentName: '', seatNumber: '', remarks: '' });
      fetchAttendanceData();
    } catch (err) {
      addToast('Failed to record malpractice', 'error');
    }
  };

  const handleMarkAllPresent = async () => {
    try {
      setSubmitting(true);
      await api.post(`/attendance/exam/${selectedExamId}/hall/${selectedHallId}/mark-all-present`);
      addToast('All remaining students marked as PRESENT', 'success');
      fetchAttendanceData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to quick-mark students';
      addToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitAttendance = async () => {
    try {
      setSubmitting(true);
      await api.post(`/attendance/exam/${selectedExamId}/hall/${selectedHallId}/submit`);
      addToast('Attendance report submitted and sealed successfully!', 'success');
      setShowSubmitModal(false);
      fetchAttendanceData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit attendance';
      addToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Convert records to allocation-like items for SeatingGrid
  const gridAllocations = records.map((r) => ({
    seatAllocationId: r.seatAllocationId,
    studentId: r.studentId,
    studentName: r.studentName,
    rollNumber: r.rollNumber,
    departmentCode: r.departmentCode,
    seatNumber: r.seatNumber,
    rowNumber: r.rowNumber,
    columnNumber: r.columnNumber,
    section: 'A'
  }));

  const activeAssignment = assignments.find(
    (a) => String(a.examId) === String(selectedExamId) && String(a.hallId) === String(selectedHallId)
  );

  return (
    <div className="space-y-6">
      {/* Top Header & Duty Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-black text-slate-900 font-display">Hall Seating & Attendance</h1>
            {summary?.submitted && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Sealed & Submitted
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time interactive seating matrix for candidate attendance verification.
          </p>
        </div>

        {/* Duty Selector Dropdown */}
        {assignments.length > 0 && (
          <div className="relative">
            <select
              value={`${selectedExamId}-${selectedHallId}`}
              onChange={(e) => {
                const [eId, hId] = e.target.value.split('-');
                handleDutyChange(eId, hId);
              }}
              className="appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2 pr-9 text-xs font-bold text-slate-700 shadow-xs focus:outline-hidden focus:border-indigo-500 cursor-pointer"
            >
              {assignments.map((a) => (
                <option key={`${a.examId}-${a.hallId}`} value={`${a.examId}-${a.hallId}`}>
                  {a.examTitle} — {a.hallName} ({a.roomNumber})
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
          </div>
        )}
      </div>

      {/* Summary KPI Badges */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Allocated</span>
            <span className="text-2xl font-black text-slate-900 block mt-0.5">{summary.totalAllocated}</span>
          </div>

          <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200 shadow-xs text-center">
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Present</span>
            <span className="text-2xl font-black text-emerald-700 block mt-0.5">{summary.presentCount}</span>
          </div>

          <div className="bg-rose-50/70 p-3.5 rounded-2xl border border-rose-200 shadow-xs text-center">
            <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block">Absent</span>
            <span className="text-2xl font-black text-rose-700 block mt-0.5">{summary.absentCount}</span>
          </div>

          <div className="bg-purple-50/70 p-3.5 rounded-2xl border border-purple-200 shadow-xs text-center">
            <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider block">Malpractice</span>
            <span className="text-2xl font-black text-purple-700 block mt-0.5">{summary.malpracticeCount}</span>
          </div>

          <div className="bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200 shadow-xs text-center">
            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">Unmarked</span>
            <span className="text-2xl font-black text-amber-700 block mt-0.5">{summary.unmarkedCount}</span>
          </div>

          <div className="bg-indigo-50/70 p-3.5 rounded-2xl border border-indigo-200 shadow-xs text-center flex flex-col justify-center">
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">Turnout</span>
            <span className="text-xl font-black text-indigo-700 block mt-0.5">
              {summary.totalAllocated > 0
                ? Math.round((summary.presentCount / summary.totalAllocated) * 100)
                : 0}
              %
            </span>
          </div>
        </div>
      )}

      {/* Action Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2 text-xs text-slate-600">
          <Building2 className="w-4 h-4 text-indigo-600" />
          <span>
            Hall: <strong>{hall?.name}</strong> | Room: <strong>{hall?.roomNumber}</strong> ({hall?.code})
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={fetchAttendanceData}
            disabled={loading}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs flex items-center space-x-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          {!summary?.submitted && (
            <>
              <button
                onClick={handleMarkAllPresent}
                disabled={submitting || summary?.unmarkedCount === 0}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Mark All Unmarked as Present</span>
              </button>

              <button
                onClick={() => setShowSubmitModal(true)}
                disabled={submitting}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Final Attendance</span>
              </button>
            </>
          )}

          {summary?.submitted && (
            <span className="px-3 py-1 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Attendance Sealed</span>
            </span>
          )}
        </div>
      </div>

      {/* Seating Grid */}
      {loading ? (
        <div className="py-24 flex justify-center">
          <LoadingSpinner />
        </div>
      ) : records.length === 0 ? (
        <EmptyState
          icon={ClipboardCheck}
          title="No Allocations in Hall"
          message="No students have been allocated to this hall for the selected examination."
        />
      ) : (
        <div className="space-y-4">
          <div className="text-xs text-slate-500 flex items-center justify-between">
            <span>Click any occupied seat to view details and update attendance (Present / Absent / Malpractice).</span>
            <span className="font-semibold text-slate-700">Rows: {hall?.totalRows} • Columns: {hall?.totalColumns}</span>
          </div>

          <SeatingGrid
            hall={hall}
            allocations={gridAllocations}
            attendances={records}
            interactiveAttendance={!summary?.submitted}
            onMarkAttendance={(studentId, status) => handleMarkAttendance(studentId, status)}
          />
        </div>
      )}

      {/* Malpractice Modal */}
      {malpracticeModal.open && (
        <Modal
          isOpen={malpracticeModal.open}
          onClose={() => setMalpracticeModal({ open: false, studentId: null, studentName: '', seatNumber: '', remarks: '' })}
          title="Report Candidate Malpractice Incident"
        >
          <form onSubmit={handleConfirmMalpractice} className="space-y-4">
            <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-900 space-y-1">
              <div className="flex items-center space-x-1 font-bold">
                <AlertTriangle className="w-4 h-4 text-purple-600" />
                <span>Candidate: {malpracticeModal.studentName} (Seat {malpracticeModal.seatNumber})</span>
              </div>
              <p className="text-[11px] text-purple-700">
                This action flags the candidate under the University Examination Malpractice Regulations and records an immediate audit trail entry.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Incident Description & Evidence Notes *
              </label>
              <textarea
                required
                rows={4}
                value={malpracticeModal.remarks}
                onChange={(e) => setMalpracticeModal({ ...malpracticeModal, remarks: e.target.value })}
                placeholder="Detail unauthorized materials discovered, unauthorized communication, or non-compliance..."
                className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-hidden focus:border-purple-500"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setMalpracticeModal({ open: false, studentId: null, studentName: '', seatNumber: '', remarks: '' })}
                className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-xs cursor-pointer"
              >
                Confirm Malpractice Mark
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Confirm Final Submit Attendance Modal */}
      {showSubmitModal && (
        <Modal
          isOpen={showSubmitModal}
          onClose={() => setShowSubmitModal(false)}
          title="Submit & Seal Official Attendance Report"
        >
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
              <div className="flex items-center space-x-1 font-bold">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Irreversible Examination Action</span>
              </div>
              <p className="text-[11px] text-amber-800">
                Submitting this attendance report will finalize and seal the records for <strong>{hall?.name}</strong>. You will no longer be able to modify attendance marks afterwards.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div>
                <span className="text-slate-400 block font-semibold">TOTAL ALLOCATED</span>
                <span className="font-bold text-slate-800">{summary?.totalAllocated}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">PRESENT CANDIDATES</span>
                <span className="font-bold text-emerald-600">{summary?.presentCount}</span>
              </div>
              <div className="mt-2">
                <span className="text-slate-400 block font-semibold">ABSENT CANDIDATES</span>
                <span className="font-bold text-rose-600">{summary?.absentCount}</span>
              </div>
              <div className="mt-2">
                <span className="text-slate-400 block font-semibold">MALPRACTICE CASES</span>
                <span className="font-bold text-purple-600">{summary?.malpracticeCount}</span>
              </div>
            </div>

            {summary?.unmarkedCount > 0 && (
              <p className="text-xs text-rose-600 font-bold">
                Warning: {summary.unmarkedCount} student(s) are still unmarked. Any remaining unmarked students will be marked as ABSENT upon sealing.
              </p>
            )}

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Review Again
              </button>
              <button
                type="button"
                onClick={handleSubmitAttendance}
                disabled={submitting}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs cursor-pointer"
              >
                {submitting ? 'Submitting...' : 'Confirm & Seal Report'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default InvigilatorAttendance;
