import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  FileText,
  Download,
  Printer,
  Users,
  Building,
  CheckCircle2,
  Calendar,
  Grid
} from 'lucide-react';

const AdminReports = () => {
  const { addToast } = useToast();
  const [exams, setExams] = useState([]);
  const [halls, setHalls] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [selectedHallId, setSelectedHallId] = useState('');
  const [activeTab, setActiveTab] = useState('hall'); // 'hall' | 'student' | 'department' | 'attendance' | 'print'
  const [reportData, setReportData] = useState([]);
  const [printPlan, setPrintPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchExamsAndHalls();
  }, []);

  useEffect(() => {
    if (selectedExamId) {
      loadActiveTabReport();
    }
  }, [selectedExamId, selectedHallId, activeTab]);

  const fetchExamsAndHalls = async () => {
    try {
      const [examsRes, hallsRes] = await Promise.all([
        api.get('/exams'),
        api.get('/halls'),
      ]);
      setExams(examsRes.data || []);
      setHalls(hallsRes.data || []);
      if (examsRes.data?.length > 0) {
        setSelectedExamId(examsRes.data[0].id.toString());
      }
      if (hallsRes.data?.length > 0) {
        setSelectedHallId(hallsRes.data[0].id.toString());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadActiveTabReport = async () => {
    try {
      setLoading(true);
      if (activeTab === 'student') {
        const res = await api.get(`/reports/students/exam/${selectedExamId}`);
        setReportData(res.data || []);
      } else if (activeTab === 'hall') {
        const res = await api.get(`/reports/halls/exam/${selectedExamId}`, {
          params: { hallId: selectedHallId || undefined },
        });
        setReportData(res.data || []);
      } else if (activeTab === 'department') {
        const res = await api.get(`/reports/departments/exam/${selectedExamId}`);
        setReportData(res.data || []);
      } else if (activeTab === 'attendance') {
        const res = await api.get(`/reports/attendance/exam/${selectedExamId}`);
        setReportData(res.data || []);
      } else if (activeTab === 'print') {
        if (selectedHallId) {
          const res = await api.get(`/reports/printable-seating-plan/exam/${selectedExamId}/hall/${selectedHallId}`);
          setPrintPlan(res.data);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCsv = () => {
    if (activeTab === 'student') {
      window.open(`/api/reports/students/exam/${selectedExamId}/csv`, '_blank');
    } else if (activeTab === 'hall' && selectedHallId) {
      window.open(`/api/reports/halls/exam/${selectedExamId}/hall/${selectedHallId}/csv`, '_blank');
    } else {
      window.open(`/api/reports/students/exam/${selectedExamId}/csv`, '_blank');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner (Hidden in Print) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 font-display">
            Examination Reports & Export Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Student roster, hall allocations, department distribution, and print-ready seating plans.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleDownloadCsv}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs flex items-center space-x-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Download CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center space-x-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Layout</span>
          </button>
        </div>
      </div>

      {/* Selectors Bar (Hidden in Print) */}
      <div className="no-print bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center gap-4">
        <div className="flex items-center space-x-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Exam:
          </label>
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="px-3.5 py-1.5 text-xs font-bold border border-slate-200 rounded-xl outline-none bg-slate-50"
          >
            {exams.map((e) => (
              <option key={e.id} value={e.id}>
                {e.subjectName} ({e.examDate})
              </option>
            ))}
          </select>
        </div>

        {(activeTab === 'hall' || activeTab === 'print') && (
          <div className="flex items-center space-x-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Hall:
            </label>
            <select
              value={selectedHallId}
              onChange={(e) => setSelectedHallId(e.target.value)}
              className="px-3.5 py-1.5 text-xs font-bold border border-slate-200 rounded-xl outline-none bg-slate-50"
            >
              {halls.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.hallName} ({h.roomNumber})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Tab switchers */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl ml-auto">
          <button
            onClick={() => setActiveTab('hall')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'hall' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500'
            }`}
          >
            Hall-wise
          </button>
          <button
            onClick={() => setActiveTab('student')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'student' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500'
            }`}
          >
            Student-wise
          </button>
          <button
            onClick={() => setActiveTab('department')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'department' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500'
            }`}
          >
            Departments
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'attendance' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500'
            }`}
          >
            Attendance
          </button>
          <button
            onClick={() => setActiveTab('print')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'print' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500'
            }`}
          >
            Print Sheet
          </button>
        </div>
      </div>

      {/* Reports Content Area */}
      {loading ? (
        <LoadingSpinner label="Compiling report..." />
      ) : activeTab === 'print' && printPlan ? (
        /* Print-Friendly Seating Sheet Layout */
        <div className="print-container bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="text-center border-b pb-4">
            <h2 className="text-xl font-black uppercase tracking-wider text-slate-900">
              {printPlan.institutionName}
            </h2>
            <h3 className="text-base font-bold text-slate-800 mt-1">{printPlan.examName}</h3>
            <p className="text-xs text-slate-500 mt-1">
              Date: <strong>{printPlan.examDate}</strong> | Time: <strong>{printPlan.startTime} - {printPlan.endTime}</strong> | Building: <strong>{printPlan.building}</strong> | Room: <strong>{printPlan.roomNumber} ({printPlan.hallName})</strong>
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-300">
              <thead className="bg-slate-100 text-slate-800 font-bold uppercase border-b border-slate-300">
                <tr>
                  <th className="p-2 border-r border-slate-300">Seat #</th>
                  <th className="p-2 border-r border-slate-300">Roll Number</th>
                  <th className="p-2 border-r border-slate-300">Student Name</th>
                  <th className="p-2 border-r border-slate-300">Branch</th>
                  <th className="p-2 border-r border-slate-300">Sec</th>
                  <th className="p-2">Student Signature</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300 font-medium">
                {printPlan.seats?.map((seat, i) => (
                  <tr key={i} className="border-b border-slate-200">
                    <td className="p-2 border-r border-slate-300 font-black text-slate-900">
                      {seat.seatNumber}
                    </td>
                    <td className="p-2 border-r border-slate-300 font-mono font-bold">
                      {seat.rollNumber}
                    </td>
                    <td className="p-2 border-r border-slate-300 font-bold text-slate-800">
                      {seat.studentName}
                    </td>
                    <td className="p-2 border-r border-slate-300">{seat.departmentCode}</td>
                    <td className="p-2 border-r border-slate-300">{seat.section}</td>
                    <td className="p-2 border-slate-300 text-slate-300">___________________</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-6 flex justify-between text-xs font-bold text-slate-700">
            <div>Invigilator Signature: _________________________</div>
            <div>Chief Superintendent: _________________________</div>
          </div>
        </div>
      ) : activeTab === 'department' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reportData.map((d, i) => (
            <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-indigo-50 text-indigo-700">
                  {d.departmentCode}
                </span>
                <span className="text-xs font-bold text-slate-500">{d.hallsUsed} halls used</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900">{d.departmentName}</h4>
              <p className="text-xl font-black text-indigo-700">{d.studentCount} students</p>
              <div className="text-[11px] text-slate-400 truncate">
                Halls: {d.hallNames?.join(', ')}
              </div>
            </div>
          ))}
        </div>
      ) : activeTab === 'attendance' ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-400 font-bold uppercase">
              <tr>
                <th className="px-6 py-3.5">Subject</th>
                <th className="px-6 py-3.5">Date</th>
                <th className="px-6 py-3.5">Total Registered</th>
                <th className="px-6 py-3.5">Present</th>
                <th className="px-6 py-3.5">Absent</th>
                <th className="px-6 py-3.5">Malpractice</th>
                <th className="px-6 py-3.5">Turnout %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {reportData.map((att, i) => (
                <tr key={i} className="hover:bg-slate-50/60">
                  <td className="px-6 py-4 font-bold text-slate-900">{att.subjectName}</td>
                  <td className="px-6 py-4 text-slate-600">{att.examDate}</td>
                  <td className="px-6 py-4 font-bold text-slate-800">{att.totalStudents}</td>
                  <td className="px-6 py-4 font-bold text-emerald-600">{att.present}</td>
                  <td className="px-6 py-4 font-bold text-rose-600">{att.absent}</td>
                  <td className="px-6 py-4 font-bold text-purple-600">{att.malpractice}</td>
                  <td className="px-6 py-4 font-black text-indigo-700">{att.attendancePercentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Hall or Student table */
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-400 font-bold uppercase">
              <tr>
                <th className="px-5 py-3.5">Seat #</th>
                <th className="px-5 py-3.5">Roll Number</th>
                <th className="px-5 py-3.5">Student Name</th>
                <th className="px-5 py-3.5">Department</th>
                <th className="px-5 py-3.5">Section</th>
                {activeTab === 'student' && <th className="px-5 py-3.5">Hall & Room</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {reportData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-slate-400">
                    No allocation records found.
                  </td>
                </tr>
              ) : (
                reportData.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/60">
                    <td className="px-5 py-3 font-mono font-black text-indigo-700 text-sm">
                      {row.seatNumber}
                    </td>
                    <td className="px-5 py-3 font-mono font-bold text-slate-900">
                      {row.rollNumber}
                    </td>
                    <td className="px-5 py-3 font-bold text-slate-800">{row.studentName}</td>
                    <td className="px-5 py-3">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700">
                        {row.departmentCode}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-bold text-slate-600">{row.section}</td>
                    {activeTab === 'student' && (
                      <td className="px-5 py-3 text-slate-700 font-medium">
                        {row.hallName} (Room {row.roomNumber})
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminReports;
