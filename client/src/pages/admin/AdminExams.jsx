import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import {
  Calendar,
  Plus,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  BookOpen,
  UserPlus,
  AlertTriangle
} from 'lucide-react';

const AdminExams = () => {
  const { addToast } = useToast();
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);

  // Student registration state
  const [registeredStudents, setRegisteredStudents] = useState([]);
  const [eligibleStudents, setEligibleStudents] = useState([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [loadingReg, setLoadingReg] = useState(false);

  // Create Exam Form State
  const [newExam, setNewExam] = useState({
    subjectId: '',
    examDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    startTime: '10:00',
    endTime: '13:00',
    semester: 3,
    academicYear: '2026-2027',
    examType: 'END_SEMESTER',
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [examsRes, subjectsRes] = await Promise.all([
        api.get('/exams'),
        api.get('/subjects?onlyActive=true'),
      ]);
      setExams(examsRes.data || []);
      setSubjects(subjectsRes.data || []);
      if (subjectsRes.data?.length > 0 && !newExam.subjectId) {
        setNewExam((prev) => ({ ...prev, subjectId: subjectsRes.data[0].id }));
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to load exams', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExam = async (e) => {
    e.preventDefault();
    try {
      // Append seconds if missing
      const payload = {
        ...newExam,
        startTime: newExam.startTime.length === 5 ? newExam.startTime + ':00' : newExam.startTime,
        endTime: newExam.endTime.length === 5 ? newExam.endTime + ':00' : newExam.endTime,
      };

      await api.post('/exams', payload);
      addToast('Examination scheduled successfully!', 'success');
      setShowCreateModal(false);
      fetchInitialData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to schedule exam';
      addToast(msg, 'error');
    }
  };

  const handleOpenRegistrations = async (exam) => {
    setSelectedExam(exam);
    setShowRegisterModal(true);
    try {
      setLoadingReg(true);
      const [regRes, allStudentsRes] = await Promise.all([
        api.get(`/exams/${exam.id}/registrations`),
        api.get('/students/active'),
      ]);

      const registered = regRes.data || [];
      const allStudents = allStudentsRes.data || [];
      setRegisteredStudents(registered);

      const registeredStudentIds = new Set(registered.map((r) => r.studentId));
      const unassigned = allStudents.filter((s) => !registeredStudentIds.has(s.id));
      setEligibleStudents(unassigned);
      setSelectedStudentIds([]);
    } catch (err) {
      console.error(err);
      addToast('Failed to load registrations', 'error');
    } finally {
      setLoadingReg(false);
    }
  };

  const handleBatchRegister = async () => {
    if (selectedStudentIds.length === 0) {
      addToast('Please select at least one student to register', 'warning');
      return;
    }

    try {
      const res = await api.post(`/exams/${selectedExam.id}/registrations`, {
        studentIds: selectedStudentIds,
      });
      addToast(res.data.message || 'Students registered successfully!', 'success');
      handleOpenRegistrations(selectedExam);
      fetchInitialData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to register students';
      addToast(msg, 'error');
    }
  };

  const handleSelectAllEligible = () => {
    if (selectedStudentIds.length === eligibleStudents.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(eligibleStudents.map((s) => s.id));
    }
  };

  const handleCancelExam = async (examId) => {
    if (!window.confirm('Are you sure you want to cancel this examination?')) return;
    try {
      await api.patch(`/exams/${examId}/cancel`);
      addToast('Examination cancelled', 'info');
      fetchInitialData();
    } catch (err) {
      addToast('Failed to cancel exam', 'error');
    }
  };

  const handleCompleteExam = async (examId) => {
    try {
      await api.patch(`/exams/${examId}/complete`);
      addToast('Examination marked as COMPLETED', 'success');
      fetchInitialData();
    } catch (err) {
      addToast('Failed to complete exam', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 font-display">Examinations Schedule</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Create exams, manage student registrations, and validate timetable conflicts.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center space-x-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule New Exam</span>
        </button>
      </div>

      {/* Exams Table */}
      {loading ? (
        <LoadingSpinner label="Loading examinations..." />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-400 font-bold uppercase">
                <tr>
                  <th className="px-5 py-3.5">Subject & Code</th>
                  <th className="px-5 py-3.5">Date & Time</th>
                  <th className="px-5 py-3.5">Semester & Year</th>
                  <th className="px-5 py-3.5">Registrations</th>
                  <th className="px-5 py-3.5">Type</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {exams.map((exam) => (
                  <tr key={exam.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900">{exam.subjectName}</div>
                      <div className="text-slate-400 font-mono text-[11px]">
                        {exam.subjectCode} • {exam.departmentName}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-800">{exam.examDate}</div>
                      <div className="text-slate-400">
                        {exam.startTime} - {exam.endTime} ({exam.durationMinutes}m)
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-bold text-slate-700">Sem {exam.semester}</span>
                      <div className="text-slate-400 text-[11px]">{exam.academicYear}</div>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleOpenRegistrations(exam)}
                        className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-xs flex items-center space-x-1 cursor-pointer"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>{exam.registeredStudentsCount} registered</span>
                      </button>
                    </td>
                    <td className="px-5 py-4 font-bold text-slate-600">{exam.examType}</td>
                    <td className="px-5 py-4">
                      <StatusBadge status={exam.status} />
                    </td>
                    <td className="px-5 py-4 text-right space-x-1.5">
                      {exam.status === 'PUBLISHED' && (
                        <button
                          onClick={() => handleCompleteExam(exam.id)}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                        >
                          Complete
                        </button>
                      )}
                      {exam.status !== 'CANCELLED' && exam.status !== 'COMPLETED' && (
                        <button
                          onClick={() => handleCancelExam(exam.id)}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-500 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Exam Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Schedule Examination">
        <form onSubmit={handleCreateExam} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Subject</label>
            <select
              value={newExam.subjectId}
              onChange={(e) => setNewExam({ ...newExam, subjectId: e.target.value })}
              className="w-full px-3.5 py-2 border rounded-xl outline-none"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code} - {s.name} ({s.departmentName})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Exam Date</label>
              <input
                type="date"
                required
                value={newExam.examDate}
                onChange={(e) => setNewExam({ ...newExam, examDate: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Start Time</label>
              <input
                type="time"
                required
                value={newExam.startTime}
                onChange={(e) => setNewExam({ ...newExam, startTime: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">End Time</label>
              <input
                type="time"
                required
                value={newExam.endTime}
                onChange={(e) => setNewExam({ ...newExam, endTime: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Semester</label>
              <input
                type="number"
                min="1"
                max="8"
                required
                value={newExam.semester}
                onChange={(e) => setNewExam({ ...newExam, semester: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border rounded-xl outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Academic Year</label>
              <input
                type="text"
                required
                value={newExam.academicYear}
                onChange={(e) => setNewExam({ ...newExam, academicYear: e.target.value })}
                placeholder="2026-2027"
                className="w-full px-3 py-2 border rounded-xl outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Exam Type</label>
              <select
                value={newExam.examType}
                onChange={(e) => setNewExam({ ...newExam, examType: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl outline-none"
              >
                <option value="END_SEMESTER">END SEMESTER</option>
                <option value="MIDTERM">MIDTERM</option>
                <option value="SUPPLEMENTARY">SUPPLEMENTARY</option>
                <option value="PRACTICAL">PRACTICAL</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 font-bold text-white shadow-md cursor-pointer"
            >
              Schedule Examination
            </button>
          </div>
        </form>
      </Modal>

      {/* Student Registrations Modal */}
      <Modal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        title={`Student Registrations: ${selectedExam?.subjectName}`}
        maxWidth="max-w-3xl"
      >
        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl">
            <div>
              <span className="font-bold text-slate-800">Currently Registered:</span>{' '}
              <strong className="text-indigo-700">{registeredStudents.length} students</strong>
            </div>
            <div className="text-[11px] text-slate-500">
              {eligibleStudents.length} unregistered active students available
            </div>
          </div>

          {eligibleStudents.length > 0 && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700">Batch Enroll Eligible Students:</span>
                <button
                  type="button"
                  onClick={handleSelectAllEligible}
                  className="text-xs text-indigo-600 font-bold hover:underline"
                >
                  {selectedStudentIds.length === eligibleStudents.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              <div className="max-h-40 overflow-y-auto divide-y divide-slate-100 bg-white rounded-lg border p-2">
                {eligibleStudents.map((s) => {
                  const isChecked = selectedStudentIds.includes(s.id);
                  return (
                    <div
                      key={s.id}
                      onClick={() =>
                        setSelectedStudentIds((prev) =>
                          prev.includes(s.id) ? prev.filter((id) => id !== s.id) : [...prev, s.id]
                        )
                      }
                      className="py-1 px-2 flex items-center justify-between hover:bg-slate-50 cursor-pointer"
                    >
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" checked={isChecked} onChange={() => {}} />
                        <span className="font-mono font-bold text-slate-800">{s.rollNumber}</span>
                        <span>{s.name}</span>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 font-bold text-slate-600">
                        {s.departmentCode} (Sec {s.section})
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleBatchRegister}
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 font-bold text-white shadow-xs hover:bg-indigo-700 cursor-pointer"
                >
                  Register {selectedStudentIds.length} Selected Students
                </button>
              </div>
            </div>
          )}

          {/* Current Registered List */}
          <div>
            <h4 className="font-bold text-slate-800 mb-2">Enrolled Student Roster:</h4>
            <div className="max-h-48 overflow-y-auto border rounded-xl divide-y divide-slate-100">
              {registeredStudents.map((reg) => (
                <div key={reg.id} className="p-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono font-bold text-slate-900 mr-2">{reg.rollNumber}</span>
                    <span className="font-semibold text-slate-800">{reg.studentName}</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {reg.departmentCode} • Sec {reg.section}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t">
            <button
              onClick={() => setShowRegisterModal(false)}
              className="px-4 py-2 rounded-xl bg-slate-900 font-bold text-white"
            >
              Done
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminExams;
