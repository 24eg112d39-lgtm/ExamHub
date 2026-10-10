import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  User,
  Mail,
  Phone,
  Building2,
  Award,
  Hash,
  ShieldCheck,
  Calendar,
  CheckCircle,
  BookOpen
} from 'lucide-react';

const StudentProfile = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/students/me');
      setProfile(res.data);
    } catch (err) {
      console.error(err);
      addToast('Failed to load profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 font-display">Student Profile & Credentials</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Official institutional identity and academic registration details.
        </p>
      </div>

      {/* Main Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Banner */}
        <div className="h-32 bg-linear-to-r from-indigo-600 via-indigo-700 to-slate-900 relative">
          <div className="absolute top-4 right-4 flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white backdrop-blur-xs flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              <span>Verified Identity</span>
            </span>
          </div>
        </div>

        {/* Profile info header */}
        <div className="px-6 sm:px-8 pb-8 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-12 sm:-mt-14 mb-6 gap-4">
            <div className="flex items-end space-x-4">
              <div className="w-24 h-24 rounded-2xl bg-white p-1.5 shadow-lg border-2 border-indigo-100">
                <div className="w-full h-full rounded-xl bg-linear-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-black text-3xl">
                  {profile?.fullName?.charAt(0) || user?.fullName?.charAt(0) || 'S'}
                </div>
              </div>
              <div className="mb-1">
                <h2 className="text-xl font-black text-slate-900 font-display">
                  {profile?.fullName || user?.fullName}
                </h2>
                <p className="text-xs font-mono text-indigo-600 font-bold">
                  Roll No: {profile?.rollNumber}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1">
                <CheckCircle className="w-3 h-3 text-emerald-600" />
                <span>Active Candidate</span>
              </span>
            </div>
          </div>

          {/* Academic Details Grid */}
          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Academic Program Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                  <div className="flex items-center space-x-2 text-slate-400 mb-1">
                    <Building2 className="w-4 h-4 text-indigo-600" />
                    <span className="text-[11px] font-bold uppercase">Department</span>
                  </div>
                  <div className="font-bold text-slate-900 text-sm">
                    {profile?.departmentName}
                  </div>
                  <span className="text-xs text-slate-500 font-mono">Code: {profile?.departmentCode}</span>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                  <div className="flex items-center space-x-2 text-slate-400 mb-1">
                    <Award className="w-4 h-4 text-indigo-600" />
                    <span className="text-[11px] font-bold uppercase">Semester & Section</span>
                  </div>
                  <div className="font-bold text-slate-900 text-sm">
                    Semester {profile?.semester}
                  </div>
                  <span className="text-xs text-slate-500 font-medium">Section {profile?.section}</span>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                  <div className="flex items-center space-x-2 text-slate-400 mb-1">
                    <Hash className="w-4 h-4 text-indigo-600" />
                    <span className="text-[11px] font-bold uppercase">Registration Number</span>
                  </div>
                  <div className="font-mono font-bold text-slate-900 text-sm">
                    {profile?.registrationNumber}
                  </div>
                  <span className="text-xs text-slate-500">University Exam Board</span>
                </div>
              </div>
            </div>

            {/* Contact Details */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Contact & Communication
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Institutional Email</span>
                    <span className="text-xs font-semibold text-slate-800 font-mono">{profile?.email || user?.email}</span>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Registered Phone</span>
                    <span className="text-xs font-semibold text-slate-800">{profile?.phone || '+91 98765 43210'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Examination Cell Notice */}
            <div className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-4 flex items-start space-x-3 text-xs">
              <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-indigo-950">Examination Record Verification</h4>
                <p className="text-indigo-800/80 mt-0.5">
                  Your academic records and student identity are validated for centralized seat allocation. For corrections to roll number, registered subjects, or department designations, please contact your Academic Administrator.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
