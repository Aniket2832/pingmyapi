import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function AIAnalysisModal({ endpoint, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/ai/analyze/${endpoint.id}`)
      .then(res => setData(res.data))
      .catch(err => setData({
        analysis: 'Failed to analyze. Try again later.',
        status: 'error'
      }))
      .finally(() => setLoading(false));
  }, [endpoint.id]);

  const statusConfig = {
    healthy: { color: 'text-green-400', bg: 'bg-green-900/20', border: 'border-green-800', icon: '✅', label: 'Healthy' },
    warning: { color: 'text-yellow-400', bg: 'bg-yellow-900/20', border: 'border-yellow-800', icon: '⚠️', label: 'Warning' },
    critical: { color: 'text-red-400', bg: 'bg-red-900/20', border: 'border-red-800', icon: '🚨', label: 'Critical' },
    pending: { color: 'text-blue-400', bg: 'bg-blue-900/20', border: 'border-blue-800', icon: '⏳', label: 'Pending' },
    error: { color: 'text-gray-400', bg: 'bg-gray-800', border: 'border-gray-700', icon: '❓', label: 'Error' },
  };

  const config = statusConfig[data?.status || 'pending'];

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-2xl shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">🤖 AI Analysis — {endpoint.name}</h2>
            <p className="text-gray-400 text-sm mt-1">Powered by Groq + Llama 3</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">✕</button>
        </div>

        {loading ? (
          <div className="py-16 text-center">
            <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-400">Analyzing performance patterns...</p>
          </div>
        ) : (
          <>
            {/* Status Badge */}
            <div className={`${config.bg} ${config.border} border rounded-2xl p-5 mb-6`}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{config.icon}</span>
                <span className={`font-bold text-lg ${config.color}`}>{config.label}</span>
              </div>
              <p className="text-gray-200 leading-relaxed">{data?.analysis}</p>
            </div>

            {/* Stats Grid */}
            {data?.stats && (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800 rounded-xl p-4">
                  <p className="text-gray-400 text-xs mb-1">Avg Response Time</p>
                  <p className={`text-2xl font-bold ${
                    data.stats.avgResponse > 2000 ? 'text-red-400' :
                    data.stats.avgResponse > 1000 ? 'text-yellow-400' : 'text-green-400'
                  }`}>{data.stats.avgResponse}ms</p>
                </div>
                <div className="bg-gray-800 rounded-xl p-4">
                  <p className="text-gray-400 text-xs mb-1">Uptime</p>
                  <p className={`text-2xl font-bold ${
                    data.stats.uptime < 80 ? 'text-red-400' :
                    data.stats.uptime < 95 ? 'text-yellow-400' : 'text-green-400'
                  }`}>{data.stats.uptime}%</p>
                </div>
                <div className="bg-gray-800 rounded-xl p-4">
                  <p className="text-gray-400 text-xs mb-1">Performance Trend</p>
                  <p className={`text-2xl font-bold ${
                    data.stats.trend === 'degrading' ? 'text-red-400' : 'text-green-400'
                  }`}>
                    {data.stats.trend === 'degrading' ? '📉' : '📈'} {data.stats.trend}
                  </p>
                </div>
                <div className="bg-gray-800 rounded-xl p-4">
                  <p className="text-gray-400 text-xs mb-1">Schema Changes</p>
                  <p className={`text-2xl font-bold ${
                    data.stats.schemaChanges > 0 ? 'text-yellow-400' : 'text-green-400'
                  }`}>{data.stats.schemaChanges}</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}