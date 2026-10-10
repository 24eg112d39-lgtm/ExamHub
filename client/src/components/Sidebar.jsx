import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Building2,
  BookOpen,
  Calendar,
  Grid,
  Sparkles,
  UserCheck,
  FileText,
  Activity,
  Award,
  ClipboardList,
  User,
  X
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, isAdmin, isInvigilator, isStudent } = useAuth();

  const adminLinks = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/allocations', icon: Sparkles, label: 'Seat Allocation' },
    { to: '/admin/exams', icon: Calendar, label: 'Examinations' },
    { to: '/admin/halls', icon: Grid, label: 'Exam Halls & Seats' },
    { to: '/admin/students', icon: Users, label: 'Students' },
    { to: '/admin/departments', icon: Building2, label: 'Departments' },
    { to: '/admin/subjects', icon: BookOpen, label: 'Subjects' },
    { to: '/admin/invigilators', icon: UserCheck, label: 'Invigilators' },
    { to: '/admin/reports', icon: FileText, label: 'Reports & Export' },
    { to: '/admin/audit-logs', icon: Activity, label: 'Audit Logs' },
  ];

  const invigilatorLinks = [
    { to: '/invigilator/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/invigilator/exams', icon: Calendar, label: 'My Assigned Exams' },
    { to: '/invigilator/attendance', icon: ClipboardList, label: 'Attendance' },
  ];

  const studentLinks = [
    { to: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/student/exams', icon: Calendar, label: 'Upcoming Exams' },
    { to: '/student/profile', icon: User, label: 'My Profile' },
  ];

  const links = isAdmin ? adminLinks : isInvigilator ? invigilatorLinks : studentLinks;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 md:static ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-extrabold shadow-sm">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-white font-display">
                EXAM<span className="text-indigo-400">HUB</span>
              </span>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                {user?.role} PORTAL
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-3.5 py-4 space-y-1.5 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User footer info */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-bold flex items-center justify-center text-xs">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-white truncate">{user?.name}</p>
              <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
