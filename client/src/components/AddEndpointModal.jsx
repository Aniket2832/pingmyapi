import { useState } from 'react';
import api from '../api/axios';

export default function AddEndpointModal({ onClose, onAdded }) {
  const [form, setForm] = useState({
    name: '', url: '', method: 'GET',
    expected_status: 200, check_interval: 5
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/endpoints', form);
      onAdded();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-6">Add New Monitor</h2>
        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text" placeholder="Monitor Name (e.g. My API)"
            className="w-full bg-gray-800 text-white px-4 py-3 rounded-xl border border-gray-700 focus:outline-none focus:border-blue-500"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            type="url" placeholder="URL (e.g. https://api.example.com/health)"
            className="w-full bg-gray-800 text-white px-4 py-3 rounded-xl border border-gray-700 focus:outline-none focus:border-blue-500"
            value={form.url}
            onChange={e => setForm({ ...form, url: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <select
              className="bg-gray-800 text-white px-4 py-3 rounded-xl border border-gray-700 focus:outline-none focus:border-blue-500"
              value={form.method}
              onChange={e => setForm({ ...form, method: e.target.value })}
            >
              <option>GET</option>
              <option>POST</option>
              <option>PUT</option>
              <option>DELETE</option>
            </select>
            <input
              type="number" placeholder="Expected Status"
              className="bg-gray-800 text-white px-4 py-3 rounded-xl border border-gray-700 focus:outline-none focus:border-blue-500"
              value={form.expected_status}
              onChange={e => setForm({ ...form, expected_status: parseInt(e.target.value) })}
            />
          </div>
          <input
            type="number" placeholder="Check interval (minutes)"
            className="w-full bg-gray-800 text-white px-4 py-3 rounded-xl border border-gray-700 focus:outline-none focus:border-blue-500"
            value={form.check_interval}
            onChange={e => setForm({ ...form, check_interval: parseInt(e.target.value) })}
          />
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-700 text-gray-400 py-3 rounded-xl hover:border-gray-500 transition">
              Cancel
            </button>
            <button type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium transition">
              Add Monitor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}