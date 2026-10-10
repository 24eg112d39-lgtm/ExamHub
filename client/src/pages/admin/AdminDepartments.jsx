import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import { Building2, Plus, CheckCircle, XCircle } from 'lucide-react';

const AdminDepartments = () => {
  const { addToast } = useToast();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDept, setNewDept] = useState({ name: '', code: '', description: '' });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/departments');
      setDepartments(res.data || []);
    } catch (err) {
      console.error(err);
      addToast('Failed to load departments', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/departments', newDept);
      addToast('Department created successfully!', 'success');
      setShowAddModal(false);
      setNewDept({ name: '', code: '', description: '' });
      fetchDepartments();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create department';
      addToast(msg, 'error');
    }
  };

  const handleDeactivate = async (id) => {
    try {
      await api.delete(`/departments/${id}`);
      addToast('Department deactivated', 'info');
      fetchDepartments();
    } catch (err) {
      addToast('Failed to deactivate department', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 font-display">Academic Departments</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage degree programs, department codes, and branch designations.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center space-x-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Department</span>
        </button>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading departments..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {departments.map((d) => (
            <div
              key={d.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {d.code}
                </span>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    d.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {d.active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900">{d.name}</h3>
              <p className="text-xs text-slate-500 leading-relaxed min-h-[36px]">
                {d.description || 'No description provided'}
              </p>
              {d.active && (
                <div className="pt-2 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => handleDeactivate(d.id)}
                    className="text-xs font-semibold text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    Deactivate
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Create Department">
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Department Name</label>
            <input
              type="text"
              required
              value={newDept.name}
              onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
              placeholder="e.g. Information Technology"
              className="w-full px-3.5 py-2 border rounded-xl outline-none"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Code</label>
            <input
              type="text"
              required
              value={newDept.code}
              onChange={(e) => setNewDept({ ...newDept, code: e.target.value })}
              placeholder="IT"
              className="w-full px-3.5 py-2 border rounded-xl outline-none font-mono uppercase"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Description</label>
            <textarea
              rows="3"
              value={newDept.description}
              onChange={(e) => setNewDept({ ...newDept, description: e.target.value })}
              placeholder="Department details..."
              className="w-full px-3.5 py-2 border rounded-xl outline-none"
            />
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
              Create Department
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminDepartments;
