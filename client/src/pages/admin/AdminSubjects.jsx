import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import { BookOpen, Plus } from 'lucide-react';

const AdminSubjects = () => {
  const { addToast } = useToast();
  const [subjects, setSubjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [newSub, setNewSub] = useState({
    code: '',
    name: '',
    departmentId: '',
    semester: 3,
    credits: 4,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [subsRes, deptsRes] = await Promise.all([
        api.get('/subjects'),
        api.get('/departments'),
      ]);
      setSubjects(subsRes.data || []);
      setDepartments(deptsRes.data || []);
      if (deptsRes.data?.length > 0 && !newSub.departmentId) {
        setNewSub((prev) => ({ ...prev, departmentId: deptsRes.data[0].id }));
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to load subjects', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/subjects', newSub);
      addToast('Subject added successfully!', 'success');
      setShowAddModal(false);
      setNewSub({
        code: '',
        name: '',
        departmentId: departments[0]?.id || '',
        semester: 3,
        credits: 4,
      });
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add subject';
      addToast(msg, 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 font-display">Academic Subjects</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Course curriculum, subject codes, assigned departments, and credits.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center space-x-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Subject</span>
        </button>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading subjects..." />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-400 font-bold uppercase">
              <tr>
                <th className="px-6 py-3.5">Code</th>
                <th className="px-6 py-3.5">Subject Name</th>
                <th className="px-6 py-3.5">Department</th>
                <th className="px-6 py-3.5">Semester</th>
                <th className="px-6 py-3.5">Credits</th>
                <th className="px-6 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {subjects.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-6 py-3.5 font-mono font-bold text-slate-900">{s.code}</td>
                  <td className="px-6 py-3.5 font-bold text-slate-800">{s.name}</td>
                  <td className="px-6 py-3.5 text-slate-600">
                    <span className="px-2 py-0.5 rounded bg-slate-100 font-bold">
                      {s.departmentCode}
                    </span>{' '}
                    {s.departmentName}
                  </td>
                  <td className="px-6 py-3.5 text-slate-600">Sem {s.semester}</td>
                  <td className="px-6 py-3.5 font-bold text-indigo-600">{s.credits} Credits</td>
                  <td className="px-6 py-3.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Academic Subject">
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Subject Code</label>
              <input
                type="text"
                required
                value={newSub.code}
                onChange={(e) => setNewSub({ ...newSub, code: e.target.value })}
                placeholder="CS303"
                className="w-full px-3.5 py-2 border rounded-xl outline-none font-mono uppercase"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Department</label>
              <select
                value={newSub.departmentId}
                onChange={(e) => setNewSub({ ...newSub, departmentId: e.target.value })}
                className="w-full px-3.5 py-2 border rounded-xl outline-none"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.code} - {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Subject Title</label>
            <input
              type="text"
              required
              value={newSub.name}
              onChange={(e) => setNewSub({ ...newSub, name: e.target.value })}
              placeholder="e.g. Operating Systems"
              className="w-full px-3.5 py-2 border rounded-xl outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Semester</label>
              <input
                type="number"
                min="1"
                max="8"
                required
                value={newSub.semester}
                onChange={(e) => setNewSub({ ...newSub, semester: parseInt(e.target.value) })}
                className="w-full px-3.5 py-2 border rounded-xl outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Credits</label>
              <input
                type="number"
                min="1"
                max="10"
                required
                value={newSub.credits}
                onChange={(e) => setNewSub({ ...newSub, credits: parseInt(e.target.value) })}
                className="w-full px-3.5 py-2 border rounded-xl outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 font-bold text-white shadow-md cursor-pointer"
            >
              Save Subject
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminSubjects;
