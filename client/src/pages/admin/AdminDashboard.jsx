import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  Users,
  Building2,
  BookOpen,
  Grid,
  Calendar,
  Sparkles,
  Award,
  ArrowRight,
  TrendingUp,
  CheckCircle2
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [upcomingExams, setUpcomingExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, examsRes] = await Promise.all([
        api.get('/admin/dashboard-stats'),
        api.get('/exams/upcoming'),
      ]);
      setStats(statsRes.data);
      setUpcomingExams(examsRes.data || []);
    } catch (err) {
      console.error('Error fetching admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading platform dashboard..." />;
  }

  return (
    <div className="space-y-6">
      {/* Page Title & Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl">
        <div>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 mb-2">
            Examination Administration Cell
          </span>
          <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight">
            Platform Command Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Automated seat allocation, hall management, timetable conflict detection, and invigilator administration.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/admin/allocations')}
            className="px-5 py-3 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition-all flex items-center space-x-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Allocation</span>
          </button>
        </div>
      </div>

      {/* Database-Generated Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <StatCard
          title="Students"
          value={stats?.totalStudents || 0}
          icon={Users}
          color="indigo"
        />
        <StatCard
          title="Departments"
          value={stats?.totalDepartments || 0}
          icon={Building2}
          color="blue"
        />
        <StatCard
          title="Exam Halls"
          value={stats?.totalHalls || 0}
          icon={Grid}
          color="emerald"
        />
        <StatCard
          title="Total Seats"
          value={stats?.totalSeats || 0}
          icon={Award}
          color="amber"
        />
        <StatCard
          title="Allocated"
          value={stats?.totalStudentsAllocated || 0}
          icon={CheckCircle2}
          color="purple"
        />
        <StatCard
          title="Attendance"
          value={`${stats?.overallAttendancePercentage || 0}%`}
          icon={TrendingUp}
          color="rose"
        />
      </div>

      {/* Upcoming Examinations & Quick Allocation Launch */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Upcoming Examinations</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Scheduled examinations awaiting or running seat allocations
            </p>
          </div>
          <button
            onClick={() => navigate('/admin/exams')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
          >
            <span>View All Exams</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/70 border-b border-slate-100 text-xs font-bold uppercase text-slate-400">
              <tr>
                <th className="px-6 py-3.5">Subject & Code</th>
                <th className="px-6 py-3.5">Date & Time</th>
                <th className="px-6 py-3.5">Registered</th>
                <th className="px-6 py-3.5">Allocated</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {upcomingExams.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-400 text-sm">
                    No scheduled exams found.
                  </td>
                </tr>
              ) : (
                upcomingExams.map((exam) => (
                  <tr key={exam.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{exam.subjectName}</div>
                      <div className="text-xs text-slate-400 font-mono">
                        {exam.subjectCode} • {exam.departmentName || 'All Depts'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">{exam.examDate}</div>
                      <div className="text-xs text-slate-400">
                        {exam.startTime} – {exam.endTime} ({exam.durationMinutes}m)
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-800">
                        {exam.registeredStudentsCount}
                      </span>{' '}
                      <span className="text-xs text-slate-400">students</span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`font-bold ${
                          exam.allocatedStudentsCount > 0 ? 'text-emerald-600' : 'text-slate-400'
                        }`}
                      >
                        {exam.allocatedStudentsCount}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={exam.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => navigate('/admin/allocations', { state: { selectedExamId: exam.id } })}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors cursor-pointer"
                      >
                        {exam.status === 'PUBLISHED' ? 'View Seating' : 'Seat Allocation'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
