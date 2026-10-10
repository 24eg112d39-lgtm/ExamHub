import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { Activity, RefreshCw, Search, Filter, ShieldCheck, Clock, User, FileText } from 'lucide-react';

const AdminAuditLogs = () => {
  const { addToast } = useToast();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('ALL');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    fetchLogs(page);
  }, [page]);

  const fetchLogs = async (pageNumber = 0) => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/audit-logs?page=${pageNumber}&size=25`);
      setLogs(res.data.content || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalElements(res.data.totalElements || 0);
    } catch (err) {
      console.error(err);
      addToast('Failed to load audit logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getActionBadgeColor = (action) => {
    if (action.includes('PUBLISH') || action.includes('COMPLETE')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (action.includes('ALLOCAT') || action.includes('ASSIGN')) return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    if (action.includes('ATTEND') || action.includes('MARK')) return 'bg-amber-50 text-amber-700 border-amber-200';
    if (action.includes('DELETE') || action.includes('CANCEL') || action.includes('MALPRACTICE')) return 'bg-rose-50 text-rose-700 border-rose-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      (log.action && log.action.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.details && log.details.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.performedByEmail && log.performedByEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.entityName && log.entityName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterAction === 'ALL' || log.action?.includes(filterAction);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-black text-slate-900 font-display">System Audit Logs</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {totalElements} Records
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Cryptographically sound, immutable trail of allocation generations, locks, and invigilator events.
          </p>
        </div>
        <button
          onClick={() => fetchLogs(page)}
          disabled={loading}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs flex items-center space-x-1.5 cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search action, user, or details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9.5 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700 focus:outline-hidden focus:border-indigo-500 font-medium"
          >
            <option value="ALL">All Actions</option>
            <option value="ALLOCATION">Seat Allocations</option>
            <option value="PUBLISH">Publish Events</option>
            <option value="ATTENDANCE">Attendance Marking</option>
            <option value="INVIGILATOR">Invigilator Actions</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner />
        </div>
      ) : filteredLogs.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="No Audit Records Found"
          message="No audit logs matched your current search filters."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Entity</th>
                  <th className="py-3 px-4">Performed By</th>
                  <th className="py-3 px-4">Details</th>
                  <th className="py-3 px-4 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getActionBadgeColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-medium text-slate-800">
                      {log.entityName} {log.entityId ? `#${log.entityId}` : ''}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-slate-600">
                      <div className="flex items-center space-x-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-medium">{log.performedByEmail || 'System'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate" title={log.details}>
                      {log.details}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>
              Page {page + 1} of {totalPages}
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-3 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 cursor-pointer font-medium"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="px-3 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 cursor-pointer font-medium"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">Audit Record #{selectedLog.id}</h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-400 block font-semibold">ACTION</span>
                  <span className="font-bold text-slate-800">{selectedLog.action}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">PERFORMED BY</span>
                  <span className="font-bold text-slate-800">{selectedLog.performedByEmail || 'System'}</span>
                </div>
                <div className="mt-2">
                  <span className="text-slate-400 block font-semibold">TARGET ENTITY</span>
                  <span className="font-bold text-slate-800">{selectedLog.entityName} {selectedLog.entityId ? `(#${selectedLog.entityId})` : ''}</span>
                </div>
                <div className="mt-2">
                  <span className="text-slate-400 block font-semibold">TIMESTAMP</span>
                  <span className="font-bold text-slate-800">{new Date(selectedLog.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-500 font-bold block mb-1">EVENT LOG PAYLOAD / DETAILS</span>
                <pre className="bg-slate-900 text-emerald-400 p-3 rounded-xl text-[11px] font-mono whitespace-pre-wrap overflow-x-auto max-h-48 border border-slate-800">
                  {selectedLog.details}
                </pre>
              </div>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 text-white hover:bg-slate-900 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAuditLogs;
