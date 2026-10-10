import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import {
  Grid,
  Plus,
  Building,
  RefreshCw,
  CheckCircle,
  XCircle,
  Eye,
  Settings
} from 'lucide-react';

const AdminHalls = () => {
  const { addToast } = useToast();
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSeatsModal, setShowSeatsModal] = useState(false);
  const [selectedHall, setSelectedHall] = useState(null);
  const [seats, setSeats] = useState([]);
  const [loadingSeats, setLoadingSeats] = useState(false);

  // Form State
  const [newHall, setNewHall] = useState({
    building: 'Main Block',
    floor: 1,
    roomNumber: '',
    hallName: '',
    totalRows: 5,
    totalColumns: 8,
  });

  useEffect(() => {
    fetchHalls();
  }, []);

  const fetchHalls = async () => {
    try {
      setLoading(true);
      const res = await api.get('/halls');
      setHalls(res.data || []);
    } catch (err) {
      console.error(err);
      addToast('Failed to load halls', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateHall = async (e) => {
    e.preventDefault();
    try {
      await api.post('/halls', newHall);
      addToast('Exam hall and seats created successfully!', 'success');
      setShowAddModal(false);
      setNewHall({
        building: 'Main Block',
        floor: 1,
        roomNumber: '',
        hallName: '',
        totalRows: 5,
        totalColumns: 8,
      });
      fetchHalls();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create hall';
      addToast(msg, 'error');
    }
  };

  const handleViewSeats = async (hall) => {
    setSelectedHall(hall);
    setShowSeatsModal(true);
    try {
      setLoadingSeats(true);
      const res = await api.get(`/halls/${hall.id}/seats`);
      setSeats(res.data || []);
    } catch (err) {
      console.error(err);
      addToast('Failed to load seats', 'error');
    } finally {
      setLoadingSeats(false);
    }
  };

  const handleToggleSeat = async (seatId) => {
    try {
      const res = await api.patch(`/halls/seats/${seatId}/toggle`);
      setSeats((prev) =>
        prev.map((s) => (s.id === seatId ? { ...s, active: res.data.active } : s))
      );
      addToast(`Seat ${res.data.seatNumber} set to ${res.data.active ? 'ACTIVE' : 'DISABLED'}`, 'info');
      fetchHalls();
    } catch (err) {
      console.error(err);
      addToast('Failed to toggle seat', 'error');
    }
  };

  const handleRegenerateSeats = async (hallId) => {
    try {
      await api.post(`/halls/${hallId}/regenerate-seats`);
      addToast('Seats matrix regenerated successfully!', 'success');
      if (selectedHall?.id === hallId) {
        handleViewSeats(selectedHall);
      }
      fetchHalls();
    } catch (err) {
      console.error(err);
      addToast('Failed to regenerate seats', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 font-display">
            Examination Halls & Seat Layouts
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Configure buildings, rooms, rows × columns matrix, and individual seat states.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center space-x-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Hall</span>
        </button>
      </div>

      {/* Hall Cards Grid */}
      {loading ? (
        <LoadingSpinner label="Loading halls..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {halls.map((hall) => (
            <div
              key={hall.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                    {hall.building} • Floor {hall.floor}
                  </span>
                  <h3 className="text-lg font-black text-slate-900 mt-0.5">{hall.hallName}</h3>
                  <p className="text-xs text-slate-400 font-mono">Room {hall.roomNumber}</p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-extrabold text-sm">
                  <Grid className="w-5 h-5" />
                </div>
              </div>

              {/* Capacity & Matrix Pills */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50">
                  <span className="text-slate-400 font-medium">Capacity</span>
                  <p className="text-base font-extrabold text-slate-900">{hall.capacity} seats</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50">
                  <span className="text-slate-400 font-medium">Matrix</span>
                  <p className="text-base font-extrabold text-slate-900">
                    {hall.totalRows}R × {hall.totalColumns}C
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  onClick={() => handleViewSeats(hall)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors flex items-center space-x-1 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Seats ({hall.activeSeats}/{hall.capacity})</span>
                </button>

                <button
                  onClick={() => handleRegenerateSeats(hall.id)}
                  title="Regenerate full rows x columns seat matrix"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Hall Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Create Examination Hall">
        <form onSubmit={handleCreateHall} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Hall Name</label>
            <input
              type="text"
              required
              value={newHall.hallName}
              onChange={(e) => setNewHall({ ...newHall, hallName: e.target.value })}
              placeholder="e.g. Hall 104 - Newton Hall"
              className="w-full px-3.5 py-2 border rounded-xl outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Building</label>
              <input
                type="text"
                required
                value={newHall.building}
                onChange={(e) => setNewHall({ ...newHall, building: e.target.value })}
                placeholder="Main Block"
                className="w-full px-3.5 py-2 border rounded-xl outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Floor Number</label>
              <input
                type="number"
                required
                value={newHall.floor}
                onChange={(e) => setNewHall({ ...newHall, floor: parseInt(e.target.value) })}
                className="w-full px-3.5 py-2 border rounded-xl outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Room Number</label>
            <input
              type="text"
              required
              value={newHall.roomNumber}
              onChange={(e) => setNewHall({ ...newHall, roomNumber: e.target.value })}
              placeholder="104"
              className="w-full px-3.5 py-2 border rounded-xl outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Total Rows (A-Z)</label>
              <input
                type="number"
                min="1"
                max="26"
                required
                value={newHall.totalRows}
                onChange={(e) => setNewHall({ ...newHall, totalRows: parseInt(e.target.value) })}
                className="w-full px-3.5 py-2 border rounded-xl outline-none bg-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Total Columns (1-50)</label>
              <input
                type="number"
                min="1"
                max="50"
                required
                value={newHall.totalColumns}
                onChange={(e) => setNewHall({ ...newHall, totalColumns: parseInt(e.target.value) })}
                className="w-full px-3.5 py-2 border rounded-xl outline-none bg-white"
              />
            </div>
            <div className="col-span-2 text-center text-slate-500 font-semibold pt-1">
              Calculated Capacity: <strong>{newHall.totalRows * newHall.totalColumns} seats</strong> (Auto-generated)
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
              Create Hall & Generate Seats
            </button>
          </div>
        </form>
      </Modal>

      {/* View Seats & Toggle Modal */}
      <Modal
        isOpen={showSeatsModal}
        onClose={() => setShowSeatsModal(false)}
        title={`Seat Layout: ${selectedHall?.hallName} (${selectedHall?.roomNumber})`}
        maxWidth="max-w-4xl"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Click any seat to toggle between <strong>Active</strong> and <strong>Disabled</strong>. Disabled seats are automatically excluded by the allocation engine.
          </p>

          {loadingSeats ? (
            <LoadingSpinner label="Loading seats..." />
          ) : (
            <div className="overflow-x-auto pb-4">
              <div className="min-w-max mx-auto p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex flex-col space-y-2">
                  {Array.from({ length: selectedHall?.totalRows || 5 }, (_, r) => {
                    const rowChar = String.fromCharCode(65 + r);
                    const rowSeats = seats.filter((s) => s.rowNumber === r + 1);

                    return (
                      <div key={rowChar} className="flex items-center space-x-2">
                        <div className="w-8 font-black text-sm text-slate-600 text-center">
                          {rowChar}
                        </div>
                        <div className="flex space-x-2">
                          {rowSeats.map((seat) => (
                            <button
                              key={seat.id}
                              onClick={() => handleToggleSeat(seat.id)}
                              className={`w-14 h-12 rounded-xl font-bold text-xs flex flex-col items-center justify-center border transition-all cursor-pointer ${
                                seat.active
                                  ? 'bg-white border-emerald-300 text-emerald-800 shadow-xs hover:border-rose-400 hover:bg-rose-50'
                                  : 'bg-slate-200 border-slate-300 text-slate-400 line-through hover:border-emerald-400 hover:bg-emerald-50'
                              }`}
                            >
                              <span>{seat.seatNumber}</span>
                              <span className="text-[9px] font-normal uppercase opacity-75">
                                {seat.active ? 'Active' : 'Off'}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-3 border-t">
            <button
              onClick={() => setShowSeatsModal(false)}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white"
            >
              Done
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminHalls;
