import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/StatusBadge';
import SeatingGrid from '../../components/SeatingGrid';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import {
  Sparkles,
  Eye,
  CheckCircle2,
  RefreshCw,
  Building,
  AlertCircle,
  BarChart3,
  Check
} from 'lucide-react';

const AdminAllocations = () => {
  const location = useLocation();
  const { addToast } = useToast();

  const [exams, setExams] = useState([]);
  const [halls, setHalls] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState(location.state?.selectedExamId || '');
  const [selectedExam, setSelectedExam] = useState(null);

  const [strategy, setStrategy] = useState('DEPARTMENT_MIXING');
  const [selectedHallIds, setSelectedHallIds] = useState([]);
  const [randomSeed, setRandomSeed] = useState('12345');

  const [allocations, setAllocations] = useState([]);
  const [selectedHallForView, setSelectedHallForView] = useState('');
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Preview state
  const [previewData, setPreviewData] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Confirmation modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedExamId) {
      const exam = exams.find((e) => e.id.toString() === selectedExamId.toString());
      setSelectedExam(exam);
      if (exam) {
        fetchAllocationsForExam(exam.id);
      }
    } else {
      setSelectedExam(null);
      setAllocations([]);
      setMetrics(null);
    }
  }, [selectedExamId, exams]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [examsRes, hallsRes] = await Promise.all([
        api.get('/exams'),
        api.get('/halls?onlyActive=true'),
      ]);
      setExams(examsRes.data || []);
      setHalls(hallsRes.data || []);

      // Default select all active halls
      const allHallIds = (hallsRes.data || []).map((h) => h.id);
      setSelectedHallIds(allHallIds);
      if (hallsRes.data?.length > 0) {
        setSelectedHallForView(hallsRes.data[0].id.toString());
      }

      if (location.state?.selectedExamId) {
        setSelectedExamId(location.state.selectedExamId.toString());
      } else if (examsRes.data?.length > 0) {
        setSelectedExamId(examsRes.data[0].id.toString());
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to load exams and halls', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllocationsForExam = async (examId) => {
    try {
      const [allocRes, metricsRes] = await Promise.allSettled([
        api.get(`/allocations/exam/${examId}`),
        api.get(`/allocations/exam/${examId}/metrics`),
      ]);

      if (allocRes.status === 'fulfilled') {
        setAllocations(allocRes.value.data || []);
      } else {
        setAllocations([]);
      }

      if (metricsRes.status === 'fulfilled') {
        setMetrics(metricsRes.value.data);
      } else {
        setMetrics(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleHall = (hallId) => {
    setSelectedHallIds((prev) =>
      prev.includes(hallId) ? prev.filter((id) => id !== hallId) : [...prev, hallId]
    );
  };

  const handlePreview = async () => {
    if (!selectedExamId || selectedHallIds.length === 0) {
      addToast('Please select an examination and at least one hall', 'warning');
      return;
    }

    try {
      setGenerating(true);
      const payload = {
        examId: parseInt(selectedExamId),
        strategy,
        hallIds: selectedHallIds,
        randomSeed: randomSeed ? parseInt(randomSeed) : null,
      };

      const res = await api.post('/allocations/preview', payload);
      setPreviewData(res.data);
      setShowPreviewModal(true);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to generate allocation preview';
      addToast(msg, 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedExamId || selectedHallIds.length === 0) {
      addToast('Please select an examination and at least one hall', 'warning');
      return;
    }

    try {
      setGenerating(true);
      setShowConfirmModal(false);
      const payload = {
        examId: parseInt(selectedExamId),
        strategy,
        hallIds: selectedHallIds,
        randomSeed: randomSeed ? parseInt(randomSeed) : null,
      };

      const res = await api.post('/allocations/generate', payload);
      addToast(`Allocation generated successfully! (${res.data.studentsAllocated} students allocated)`, 'success');

      // Refresh exam details and allocations
      await fetchInitialData();
      await fetchAllocationsForExam(selectedExamId);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to generate allocation';
      addToast(msg, 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handlePublish = async () => {
    if (!selectedExamId) return;

    try {
      setGenerating(true);
      const res = await api.post(`/allocations/${selectedExamId}/publish`);
      addToast('Examination seating allocation PUBLISHED! Students notified.', 'success');
      await fetchInitialData();
      await fetchAllocationsForExam(selectedExamId);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to publish allocation';
      addToast(msg, 'error');
    } finally {
      setGenerating(false);
    }
  };

  const activeHallData = halls.find((h) => h.id.toString() === selectedHallForView);
  const currentHallAllocations = allocations.filter(
    (a) => a.hallId.toString() === selectedHallForView
  );

  if (loading) {
    return <LoadingSpinner label="Loading allocation workspace..." />;
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 font-display">
            Seat Allocation Engine
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Automatic seating plan generator with configurable strategies and conflict prevention.
          </p>
        </div>

        {selectedExam && (
          <div className="flex items-center space-x-2">
            <StatusBadge status={selectedExam.status} />
            {selectedExam.status === 'ALLOCATION_GENERATED' && (
              <button
                onClick={handlePublish}
                disabled={generating}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center space-x-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Publish Allocation</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Configuration & Action Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Exam Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Select Examination
            </label>
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-600 outline-none"
            >
              <option value="">-- Choose Examination --</option>
              {exams.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.subjectName} ({e.subjectCode}) • {e.examDate} [{e.status}]
                </option>
              ))}
            </select>

            {selectedExam && (
              <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Date & Time:</span>
                  <span className="font-bold text-slate-800">
                    {selectedExam.examDate} ({selectedExam.startTime} - {selectedExam.endTime})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Registered Students:</span>
                  <span className="font-bold text-indigo-600">
                    {selectedExam.registeredStudentsCount} eligible students
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Strategy Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Allocation Strategy
            </label>
            <select
              value={strategy}
              onChange={(e) => setStrategy(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-600 outline-none"
            >
              <option value="DEPARTMENT_MIXING">Department Mixing (Recommended)</option>
              <option value="SEQUENTIAL">Sequential Allocation</option>
              <option value="SECTION_MIXING">Section Mixing</option>
              <option value="RANDOM">Deterministic Random Allocation</option>
            </select>

            <div className="mt-3">
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Random Seed (for audit reproducibility):
              </label>
              <input
                type="text"
                value={randomSeed}
                onChange={(e) => setRandomSeed(e.target.value)}
                placeholder="12345"
                className="w-full px-3 py-1.5 text-xs font-mono border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Hall Selection Checkboxes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Available Halls to Include
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {halls.map((h) => {
                const isSelected = selectedHallIds.includes(h.id);
                return (
                  <div
                    key={h.id}
                    onClick={() => handleToggleHall(h.id)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}} // handled by parent div
                        className="rounded text-indigo-600"
                      />
                      <span>{h.hallName}</span>
                    </div>
                    <span className="font-mono text-[11px] text-slate-400">
                      {h.capacity} seats ({h.building})
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Buttons Bar */}
        <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            onClick={handlePreview}
            disabled={generating || !selectedExamId}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
          >
            <Eye className="w-4 h-4" />
            <span>Preview Allocation</span>
          </button>

          {selectedExam?.status === 'ALLOCATION_GENERATED' && (
            <button
              onClick={() => setShowConfirmModal(true)}
              disabled={generating}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white transition-colors flex items-center space-x-1.5 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Regenerate Draft</span>
            </button>
          )}

          {selectedExam?.status !== 'PUBLISHED' ? (
            <button
              onClick={() => setShowConfirmModal(true)}
              disabled={generating || !selectedExamId}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all flex items-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate Seat Allocation</span>
            </button>
          ) : (
            <div className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200 flex items-center space-x-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Allocation is Published & Locked</span>
            </div>
          )}
        </div>
      </div>

      {/* Live Quality Metrics Breakdown */}
      {metrics && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">Allocation Quality Metrics</h3>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-400">Mixing Score:</span>
              <span className="px-2.5 py-1 rounded-full text-xs font-black bg-indigo-50 text-indigo-700 border border-indigo-200">
                {metrics.mixingScore}% Optimal
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Allocated</span>
              <p className="text-xl font-extrabold text-slate-900 mt-0.5">
                {metrics.studentsAllocated} <span className="text-xs text-slate-400">students</span>
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Capacity Used</span>
              <p className="text-xl font-extrabold text-slate-900 mt-0.5">
                {metrics.capacityUtilizationPercentage}%
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Remaining Seats</span>
              <p className="text-xl font-extrabold text-slate-900 mt-0.5">
                {metrics.remainingCapacity} <span className="text-xs text-slate-400">seats</span>
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Halls Utilized</span>
              <p className="text-xl font-extrabold text-slate-900 mt-0.5">
                {metrics.hallsUsed} <span className="text-xs text-slate-400">rooms</span>
              </p>
            </div>
          </div>

          {/* Department distribution pills */}
          {metrics.departmentDistribution && (
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Department Distribution:
              </span>
              <div className="flex flex-wrap gap-2">
                {Object.entries(metrics.departmentDistribution).map(([dept, count]) => (
                  <span
                    key={dept}
                    className="px-3 py-1 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200"
                  >
                    {dept}: {count} students
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Visual Seating Plan Grid View */}
      {allocations.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Hall Seating Layout Preview</h2>
              <p className="text-xs text-slate-500">
                Visual seat assignments for examination {selectedExam?.subjectName}
              </p>
            </div>

            {/* Hall filter selector */}
            <div className="flex items-center space-x-2">
              <label className="text-xs font-bold text-slate-500">Switch Hall:</label>
              <select
                value={selectedHallForView}
                onChange={(e) => setSelectedHallForView(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-white"
              >
                {halls
                  .filter((h) => selectedHallIds.includes(h.id))
                  .map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.hallName} ({h.roomNumber})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {activeHallData && (
            <SeatingGrid
              hall={activeHallData}
              allocations={currentHallAllocations}
            />
          )}
        </div>
      )}

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Seat Allocation"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">
            Generate seating allocation for{' '}
            <strong className="text-slate-900">
              {selectedExam?.registeredStudentsCount} students
            </strong>{' '}
            using <strong className="text-indigo-600">{strategy.replace('_', ' ')}</strong> across{' '}
            <strong className="text-slate-900">{selectedHallIds.length} examination halls</strong>?
          </p>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              onClick={() => setShowConfirmModal(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-600"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerate}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md cursor-pointer"
            >
              Confirm & Generate
            </button>
          </div>
        </div>
      </Modal>

      {/* Preview Modal */}
      <Modal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        title="Allocation Preview (Draft)"
        maxWidth="max-w-4xl"
      >
        {previewData && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400">Total Students</span>
                <p className="font-extrabold text-base text-slate-900">{previewData.totalStudents}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400">Total Capacity</span>
                <p className="font-extrabold text-base text-slate-900">{previewData.totalCapacity}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400">Strategy</span>
                <p className="font-extrabold text-base text-indigo-600">{previewData.strategy}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400">Mixing Score</span>
                <p className="font-extrabold text-base text-emerald-600">
                  {previewData.metrics?.mixingScore}%
                </p>
              </div>
            </div>

            {/* Hall breakdown */}
            <div>
              <h4 className="text-xs font-bold uppercase text-slate-500 mb-2">Hall-by-Hall Allocation</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {Object.entries(previewData.hallBreakdown || {}).map(([hName, count]) => (
                  <div key={hName} className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl">
                    <span className="font-bold text-xs text-slate-800">{hName}</span>
                    <p className="text-lg font-black text-indigo-700 mt-1">{count} students</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-600"
              >
                Close Preview
              </button>
              <button
                onClick={() => {
                  setShowPreviewModal(false);
                  handleGenerate();
                }}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md cursor-pointer"
              >
                Accept & Commit Allocation
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminAllocations;
