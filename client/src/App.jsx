import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layout & Protected Route
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminAllocations from './pages/admin/AdminAllocations';
import AdminExams from './pages/admin/AdminExams';
import AdminHalls from './pages/admin/AdminHalls';
import AdminStudents from './pages/admin/AdminStudents';
import AdminDepartments from './pages/admin/AdminDepartments';
import AdminSubjects from './pages/admin/AdminSubjects';
import AdminInvigilators from './pages/admin/AdminInvigilators';
import AdminReports from './pages/admin/AdminReports';
import AdminAuditLogs from './pages/admin/AdminAuditLogs';

// Invigilator Pages
import InvigilatorDashboard from './pages/invigilator/InvigilatorDashboard';
import InvigilatorExams from './pages/invigilator/InvigilatorExams';
import InvigilatorAttendance from './pages/invigilator/InvigilatorAttendance';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentExams from './pages/student/StudentExams';
import StudentProfile from './pages/student/StudentProfile';

// Root redirect handler
const RootRedirect = () => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <LoadingSpinner label="Authenticating session..." />
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'INVIGILATOR') return <Navigate to="/invigilator/dashboard" replace />;
  if (user.role === 'STUDENT') return <Navigate to="/student/dashboard" replace />;

  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <Routes>
      {/* Public Authentication Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Authenticated Workspace with Shell Layout */}
      <Route element={<Layout />}>
        {/* Administrator Routes */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/allocations" element={<AdminAllocations />} />
          <Route path="/admin/exams" element={<AdminExams />} />
          <Route path="/admin/halls" element={<AdminHalls />} />
          <Route path="/admin/students" element={<AdminStudents />} />
          <Route path="/admin/departments" element={<AdminDepartments />} />
          <Route path="/admin/subjects" element={<AdminSubjects />} />
          <Route path="/admin/invigilators" element={<AdminInvigilators />} />
          <Route path="/admin/reports" element={<AdminReports />} />
          <Route path="/admin/audit-logs" element={<AdminAuditLogs />} />
        </Route>

        {/* Invigilator / Faculty Routes */}
        <Route element={<ProtectedRoute allowedRoles={['INVIGILATOR']} />}>
          <Route path="/invigilator/dashboard" element={<InvigilatorDashboard />} />
          <Route path="/invigilator/exams" element={<InvigilatorExams />} />
          <Route path="/invigilator/attendance" element={<InvigilatorAttendance />} />
        </Route>

        {/* Student Candidate Routes */}
        <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/exams" element={<StudentExams />} />
          <Route path="/student/profile" element={<StudentProfile />} />
        </Route>
      </Route>

      {/* Global Fallback & Entry Routes */}
      <Route path="/" element={<RootRedirect />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
