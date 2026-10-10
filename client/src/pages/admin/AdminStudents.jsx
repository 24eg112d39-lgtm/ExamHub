import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import {
  Users,
  Search,
  Plus,
  Upload,
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';

const AdminStudents = () => {
  const { addToast } = useToast();

  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [csvContent, setCsvContent] = useState('');
  const [importResult, setImportResult] = useState(null);

  // Add Student Form State
  const [newStudent, setNewStudent] = useState({
    rollNumber: '',
    registrationNumber: '',
    name: '',
    email: '',
    phone: '',
    departmentId: '',
    section: 'A',
    semester: 3,
    academicYear: 2,
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [page, search, selectedDept, selectedSemester, selectedSection]);

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/departments');
      setDepartments(res.data || []);
      if (res.data?.length > 0 && !newStudent.departmentId) {
        setNewStudent((prev) => ({ ...prev, departmentId: res.data[0].id }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        size: 15,
        search: search || undefined,
        departmentId: selectedDept || undefined,
        semester: selectedSemester || undefined,
        section: selectedSection || undefined,
      };

      const res = await api.get('/students', { params });
      setStudents(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
      setTotalStudents(res.data.totalElements || 0);
    } catch (err) {
      console.error(err);
      addToast('Failed to load students', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      await api.post('/students', newStudent);
      addToast('Student added successfully!', 'success');
      setShowAddModal(false);
      setNewStudent({
        rollNumber: '',
        registrationNumber: '',
        name: '',
        email: '',
        phone: '',
        departmentId: departments[0]?.id || '',
        section: 'A',
        semester: 3,
        academicYear: 2,
      });
      fetchStudents();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add student';
      addToast(msg, 'error');
    }
  };

  const handleCsvImport = async () => {
    if (!csvContent.trim()) {
      addToast('Please paste CSV content', 'warning');
      return;
    }

    try {
      const res = await api.post('/students/import-csv', csvContent, {
        headers: { 'Content-Type': 'text/plain' },
      });
      setImportResult(res.data);
      addToast(
        `Imported ${res.data.imported} students. (${res.data.failed} failed)`,
        res.data.failed > 0 ? 'warning' : 'success'
      );
      fetchStudents();
    } catch (err) {
      const msg = err.response?.data?.message || 'CSV Import failed';
      addToast(msg, 'error');
    }
  };

  const loadSampleCsv = () => {
    const sample = `rollNumber,registrationNumber,name,email,department,section,semester,year
CS2026101,REG-CS-101,Aakash Deep,aakash.cs@examhub.com,CSE,A,3,2
CS2026102,REG-CS-102,Bhavya Sen,bhavya.cs@examhub.com,CSE,A,3,2
EC2026101,REG-EC-101,Chetan Bhagat,chetan.ec@examhub.com,ECE,B,3,2
ME2026101,REG-ME-101,Deepak Chopra,deepak.me@examhub.com,MECH,A,3,2`;
    setCsvContent(sample);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 font-display">Student Directory</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage academic student enrolments, sections, and CSV batch imports.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => {
              setImportResult(null);
              setShowImportModal(true);
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs flex items-center space-x-1.5 cursor-pointer"
          >
            <Upload className="w-4 h-4 text-indigo-600" />
            <span>CSV Import</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center space-x-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            placeholder="Search roll, reg#, name..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={selectedDept}
            onChange={(e) => {
              setSelectedDept(e.target.value);
              setPage(0);
            }}
            className="px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none bg-white text-slate-700 font-medium"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.code} - {d.name}
              </option>
            ))}
          </select>

          <select
            value={selectedSemester}
            onChange={(e) => {
              setSelectedSemester(e.target.value);
              setPage(0);
            }}
            className="px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none bg-white text-slate-700 font-medium"
          >
            <option value="">All Semesters</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <option key={s} value={s}>
                Semester {s}
              </option>
            ))}
          </select>

          <select
            value={selectedSection}
            onChange={(e) => {
              setSelectedSection(e.target.value);
              setPage(0);
            }}
            className="px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none bg-white text-slate-700 font-medium"
          >
            <option value="">All Sections</option>
            <option value="A">Section A</option>
            <option value="B">Section B</option>
            <option value="C">Section C</option>
          </select>
        </div>
      </div>

      {/* Students Data Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-400 font-bold uppercase">
              <tr>
                <th className="px-5 py-3.5">Roll Number</th>
                <th className="px-5 py-3.5">Registration #</th>
                <th className="px-5 py-3.5">Full Name</th>
                <th className="px-5 py-3.5">Department</th>
                <th className="px-5 py-3.5">Section</th>
                <th className="px-5 py-3.5">Semester</th>
                <th className="px-5 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-10">
                    <LoadingSpinner label="Loading students..." />
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-slate-400">
                    No students matched the query filters.
                  </td>
                </tr>
              ) : (
                students.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3 font-mono font-bold text-slate-900">{s.rollNumber}</td>
                    <td className="px-5 py-3 font-mono text-slate-500">{s.registrationNumber}</td>
                    <td className="px-5 py-3 font-bold text-slate-800">{s.name}</td>
                    <td className="px-5 py-3">
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700">
                        {s.departmentCode}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-bold text-slate-700">{s.section}</td>
                    <td className="px-5 py-3 text-slate-600">Sem {s.semester}</td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Active
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing page <strong>{page + 1}</strong> of <strong>{Math.max(1, totalPages)}</strong> (Total {totalStudents} students)
          </span>
          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => (p + 1 < totalPages ? p + 1 : p))}
              disabled={page + 1 >= totalPages}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Add Student Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Register New Student">
        <form onSubmit={handleAddStudent} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Roll Number</label>
              <input
                type="text"
                required
                value={newStudent.rollNumber}
                onChange={(e) => setNewStudent({ ...newStudent, rollNumber: e.target.value })}
                placeholder="CS2026099"
                className="w-full px-3 py-2 border rounded-xl outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Registration #</label>
              <input
                type="text"
                required
                value={newStudent.registrationNumber}
                onChange={(e) => setNewStudent({ ...newStudent, registrationNumber: e.target.value })}
                placeholder="REG-CS-099"
                className="w-full px-3 py-2 border rounded-xl outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Student Full Name</label>
            <input
              type="text"
              required
              value={newStudent.name}
              onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
              placeholder="Rahul Dravid"
              className="w-full px-3 py-2 border rounded-xl outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={newStudent.email}
                onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                placeholder="rahul@examhub.com"
                className="w-full px-3 py-2 border rounded-xl outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Phone</label>
              <input
                type="tel"
                value={newStudent.phone}
                onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                placeholder="+91 9123456789"
                className="w-full px-3 py-2 border rounded-xl outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Department</label>
              <select
                value={newStudent.departmentId}
                onChange={(e) => setNewStudent({ ...newStudent, departmentId: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl outline-none"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.code}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Section</label>
              <input
                type="text"
                required
                value={newStudent.section}
                onChange={(e) => setNewStudent({ ...newStudent, section: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Semester</label>
              <input
                type="number"
                min="1"
                max="8"
                required
                value={newStudent.semester}
                onChange={(e) => setNewStudent({ ...newStudent, semester: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border rounded-xl outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 font-bold text-white shadow-md"
            >
              Save Student
            </button>
          </div>
        </form>
      </Modal>

      {/* CSV Import Modal */}
      <Modal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        title="Batch Import Students via CSV"
        maxWidth="max-w-3xl"
      >
        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <p className="text-slate-600">
              Paste CSV text formatted with headers: <code>rollNumber,registrationNumber,name,email,department,section,semester,year</code>
            </p>
            <button
              type="button"
              onClick={loadSampleCsv}
              className="text-indigo-600 font-bold hover:underline"
            >
              Load Sample Template
            </button>
          </div>

          <textarea
            rows="7"
            value={csvContent}
            onChange={(e) => setCsvContent(e.target.value)}
            placeholder="rollNumber,registrationNumber,name,email,department,section,semester,year..."
            className="w-full p-3 font-mono text-xs border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
          />

          {importResult && (
            <div className="p-4 bg-slate-50 rounded-xl border space-y-2">
              <div className="flex items-center justify-between font-bold">
                <span className="text-emerald-700 flex items-center space-x-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Imported: {importResult.imported}</span>
                </span>
                <span className="text-rose-700 flex items-center space-x-1">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Failed: {importResult.failed}</span>
                </span>
              </div>

              {importResult.errors?.length > 0 && (
                <div className="max-h-32 overflow-y-auto divide-y divide-slate-200 pt-2 text-[11px]">
                  {importResult.errors.map((err, idx) => (
                    <div key={idx} className="py-1 text-rose-600">
                      <strong>Row {err.rowNumber} ({err.identifier}):</strong> {err.error}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-3 border-t">
            <button
              type="button"
              onClick={() => setShowImportModal(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 font-bold"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleCsvImport}
              className="px-5 py-2 rounded-xl bg-indigo-600 font-bold text-white shadow-md"
            >
              Run Batch Import
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminStudents;
