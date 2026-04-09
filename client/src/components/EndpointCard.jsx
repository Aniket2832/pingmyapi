import AIAnalysisModal from './AIAnalysisModal';
import { useState } from 'react';
import api from '../api/axios';
import LogsModal from './LogsModal';
import DiffModal from './DiffModal';

export default function EndpointCard({ endpoint, onRefresh }) {
  const [showLogs, setShowLogs] = useState(false);
  const [showDiff, setShowDiff] = useState(false);
  const [showAI, setShowAI] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Delete this monitor?')) return;
    await api.delete(`/endpoints/${endpoint.id}`);
    onRefresh();
  };

  const handleToggle = async () => {
    await api.patch(`/endpoints/${endpoint.id}/toggle`);
    onRefresh();
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex items-center justify-between hover:border-gray-600 transition">
      <div className="flex items-center gap-4">
        <div className={`w-3 h-3 rounded-full ${endpoint.is_active ? 'bg-green-400 animate-pulse' : 'bg-gray-600'}`} />
        <div>
          <p className="font-semibold text-white">{endpoint.name}</p>
          <p className="text-gray-400 text-sm">{endpoint.url}</p>
          <p className="text-gray-500 text-xs mt-1">
            Method: {endpoint.method} · Expected: {endpoint.expected_status} · Every {endpoint.check_interval} min
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className={`text-xs px-3 py-1 rounded-full font-medium ${endpoint.is_active ? 'bg-green-900/40 text-green-400' : 'bg-gray-800 text-gray-400'}`}>
          {endpoint.is_active ? 'Active' : 'Paused'}
        </span>
        <button
          onClick={() => setShowLogs(true)}
          className="text-sm text-blue-400 hover:text-blue-300 border border-blue-800 px-3 py-1.5 rounded-lg transition"
        >
          Logs
        </button>
        <button
          onClick={() => setShowDiff(true)}
          className="text-sm text-purple-400 hover:text-purple-300 border border-purple-800 px-3 py-1.5 rounded-lg transition"
        >
          Diff
        </button>
        <button
  onClick={() => setShowAI(true)}
  className="text-sm text-green-400 hover:text-green-300 border border-green-800 px-3 py-1.5 rounded-lg transition"
>
  AI ✨
</button>
        <button
          onClick={handleToggle}
          className="text-sm text-yellow-400 hover:text-yellow-300 border border-yellow-800 px-3 py-1.5 rounded-lg transition"
        >
          {endpoint.is_active ? 'Pause' : 'Resume'}
        </button>
        <button
          onClick={handleDelete}
          className="text-sm text-red-400 hover:text-red-300 border border-red-800 px-3 py-1.5 rounded-lg transition"
        >
          Delete
        </button>
      </div>

      {showLogs && <LogsModal endpoint={endpoint} onClose={() => setShowLogs(false)} />}
      {showDiff && <DiffModal endpoint={endpoint} onClose={() => setShowDiff(false)} />}
      {showAI && <AIAnalysisModal endpoint={endpoint} onClose={() => setShowAI(false)} />}  
    </div>
  );
}