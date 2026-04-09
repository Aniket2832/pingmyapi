import { useState, useEffect } from 'react';
import api from '../api/axios';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';

export default function LogsModal({ endpoint, onClose }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/logs/${endpoint.id}`)
      .then(res => setLogs(res.data))
      .finally(() => setLoading(false));
  }, [endpoint.id]);

  const chartData = [...logs]
    .reverse()
    .map(log => ({
      time: new Date(log.checked_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      responseTime: log.response_time_ms,
      status: log.is_up ? 'up' : 'down',
    }));

  const avgResponse = logs.length
    ? Math.round(logs.reduce((sum, l) => sum + l.response_time_ms, 0) / logs.length)
    : 0;

  const uptime = logs.length
    ? Math.round((logs.filter(l => l.is_up).length / logs.length) * 100)
    : 0;

  const CustomDot = (props) => {
    const { cx, cy, payload } = props;
    return (
      <circle
        cx={cx} cy={cy} r={4}
        fill={payload.status === 'up' ? '#34d399' : '#f87171'}
        stroke="none"
      />
    );
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm">
          <p className="text-gray-400">{label}</p>
          <p className="text-green-400 font-semibold">{payload[0].value}ms</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-3xl shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">📋 {endpoint.name}</h2>
            <p className="text-gray-400 text-sm mt-1">{endpoint.url}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">✕</button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-800 rounded-xl p-4 text-center">
            <p className="text-gray-400 text-xs mb-1">Uptime</p>
            <p className="text-2xl font-bold text-green-400">{uptime}%</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 text-center">
            <p className="text-gray-400 text-xs mb-1">Avg Response</p>
            <p className="text-2xl font-bold text-blue-400">{avgResponse}ms</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 text-center">
            <p className="text-gray-400 text-xs mb-1">Total Pings</p>
            <p className="text-2xl font-bold text-white">{logs.length}</p>
          </div>
        </div>

        {/* Chart */}
        {!loading && chartData.length > 1 && (
          <div className="bg-gray-800 rounded-xl p-4 mb-6">
            <p className="text-gray-400 text-sm mb-4">Response Time (ms)</p>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="time"
                  tick={{ fill: '#9ca3af', fontSize: 11 }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fill: '#9ca3af', fontSize: 11 }}
                  width={45}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="responseTime"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={<CustomDot />}
                  activeDot={{ r: 6, fill: '#60a5fa' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Logs List */}
        <p className="text-gray-400 text-sm mb-3">Recent Pings</p>
        {loading ? (
          <p className="text-gray-400">Loading logs...</p>
        ) : logs.length === 0 ? (
          <p className="text-gray-500">No logs yet — waiting for first ping...</p>
        ) : (
          <div className="space-y-2">
            {logs.map(log => (
              <div
                key={log.id}
                className={`flex items-center justify-between p-3 rounded-xl border text-sm
                  ${log.is_up
                    ? 'border-green-900 bg-green-900/10'
                    : 'border-red-900 bg-red-900/10'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <span>{log.is_up ? '✅' : '❌'}</span>
                  <span className="text-white font-medium">HTTP {log.status_code}</span>
                  {log.schema_changed && (
                    <span className="text-yellow-400 bg-yellow-900/30 px-2 py-0.5 rounded-full text-xs">
                      ⚠️ Schema Changed
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-gray-400">
                  <span className={log.response_time_ms > 1000 ? 'text-yellow-400' : 'text-gray-400'}>
                    {log.response_time_ms}ms
                  </span>
                  <span>{new Date(log.checked_at).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}