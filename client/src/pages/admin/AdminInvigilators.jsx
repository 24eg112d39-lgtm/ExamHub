import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import { UserCheck, Plus, Trash2, Calendar, Building } from 'lucide-react';

const AdminInvigilators = () => {
  const { addToast } = useToast();
  const [invigilators, setInvigilators] = useState([]);
  const [exams, setExams] = useState([]);
  const [halls, setHalls] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);

  const [assignForm, setAssignForm] = useState({
    invigilatorId: '',
    hallId: '',
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedExamId) {
      fetchAssignments(selectedExamId);
    }
  }, [selectedExamId]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [invsRes, examsRes, hallsRes] = await Promise.all([
        api.get('/invigilators'),
        api.get('/exams'),
        api.get('/halls?onlyActive=true'),
      ]);
      setInvigilators(invsRes.data || []);
      setExams(examsRes.data || []);
      setHalls(hallsRes.data || []);

      if (examsRes.data?.length > 0) {
        setSelectedExamId(examsRes.data[0].id.toString());
      }
      if (invsRes.data?.length > 0 && hallsRes.data?.length > 0) {
        setAssignForm({
          invigilatorId: invsRes.data[0].id.toString(),
          hallId: hallsRes.data[0].id.toString(),
        });
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to load invigilator data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async (examId) => {
    try {
      const res = await api.get(`/invigilators/exam/${examId}`);
      setAssignments(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        examId: parseInt(selectedExamId),
        invigilatorId: parseInt(assignForm.invigilatorId),
        hallId: parseInt(assignForm.hallId),
      };

      await api.post('/invigilators/assign', payload);
      addToast('Invigilator assigned to hall successfully!', 'success');
      setShowAssignModal(false);
      fetchAssignments(selectedExamId);
    } catch (err) {
      const msg = err.response?.data?.message || 'Assignment failed';
      addToast(msg, 'error');
    }
  };

  const handleRemoveAssignment = async (assignmentId) => {
    if (!window.confirm('Remove this invigilation duty assignment?')) return;
    try {
      await api.delete(`/invigilators/assignments/${assignmentId}`);
      addToast('Assignment removed', 'info');
      fetchAssignments(selectedExamId);
    } catch (err) {
      addToast('Failed to remove assignment', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 font-display">
            Invigilator Duty Assignments
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Assign qualified faculty to examination halls with schedule overlap collision checks.
          </p>
        </div>

        <button
          onClick={() => setShowAssignModal(true)}
          disabled={!selectedExamId}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center space-x-1.5 cursor-pointer self-start sm:self-auto disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span>Assign Invigilator</span>
        </button>
      </div>

      {/* Select Exam Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center space-x-3">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Examination:
        </label>
        <select
          value={selectedExamId}
          onChange={(e) => setSelectedExamId(e.target.value)}
          className="px-3.5 py-2 text-xs font-bold border border-slate-200 rounded-xl outline-none bg-slate-50 text-slate-800"
        >
          {exams.map((e) => (
            <option key={e.id} value={e.id}>
              {e.subjectName} ({e.examDate}) [{e.status}]
            </option>
          ))}
        </select>
      </div>

      {/* Assignments Table */}
      {loading ? (
        <LoadingSpinner label="Loading assignments..." />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-400 font-bold uppercase">
              <tr>
                <th className="px-6 py-3.5">Invigilator Name</th>
                <th className="px-6 py-3.5">Assigned Hall</th>
                <th className="px-6 py-3.5">Building & Room</th>
                <th className="px-6 py-3.5">Students in Hall</th>
                <th className="px-6 py-3.5">Duty Status</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {assignments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-slate-400">
                    No invigilators assigned to this exam yet.
                  </td>
                </tr>
              ) : (
                assignments.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{a.invigilatorName}</div>
                      <div className="text-slate-400 text-[11px]">{a.invigilatorEmail}</div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">{a.hallName}</td>
                    <td className="px-6 py-4 text-slate-600 font-mono">
                      {a.building} • Room {a.roomNumber}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                        {a.assignedStudentsCount} students
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] ${
                          a.status === 'COMPLETED'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-blue-50 text-blue-700'
                        }`}
                      >
                        {a.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleRemoveAssignment(a.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Remove assignment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Assign Modal */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title="Assign Invigilator Duty"
      >
        <form onSubmit={handleAssign} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Select Faculty</label>
            <select
              value={assignForm.invigilatorId}
              onChange={(e) => setAssignForm({ ...assignForm, invigilatorId: e.target.value })}
              className="w-full px-3.5 py-2 border rounded-xl outline-none"
            >
              {invigilators.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name} ({i.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Select Hall</label>
            <select
              value={assignForm.hallId}
              onChange={(e) => setAssignForm({ ...assignForm, hallId: e.target.value })}
              className="w-full px-3.5 py-2 border rounded-xl outline-none"
            >
              {halls.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.hallName} (Room {h.roomNumber}, {h.building})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t">
            <button
              type="button"
              onClick={() => setShowAssignModal(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 font-bold text-white shadow-md cursor-pointer"
            >
              Confirm Assignment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminInvigilators;
