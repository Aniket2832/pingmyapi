import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';

export default function StatusPage() {
  const { userId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/endpoints/public/${userId}`)
      .then(res => setData(res.data))
      .catch(() => setError('Status page not found'))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-gray-400">Loading status page...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-red-400">{error}</p>
    </div>
  );

  const allUp = data.endpoints.every(e => e.last_status === true);
  const someDown = data.endpoints.some(e => e.last_status === false);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900 px-6 py-6 text-center">
        <h1 className="text-3xl font-bold text-white mb-1">
          🔔 {data.user.name}'s API Status
        </h1>
        <p className="text-gray-400 text-sm">Real-time status of all monitored APIs</p>
        <p className="text-gray-500 text-xs mt-2">
          Last updated: {new Date().toLocaleString()}
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Overall Status Banner */}
        <div className={`rounded-2xl p-6 mb-8 text-center border ${
          allUp
            ? 'bg-green-900/20 border-green-800'
            : someDown
            ? 'bg-red-900/20 border-red-800'
            : 'bg-yellow-900/20 border-yellow-800'
        }`}>
          <p className="text-4xl mb-2">
            {allUp ? '✅' : someDown ? '🔴' : '⚠️'}
          </p>
          <p className={`text-xl font-bold ${
            allUp ? 'text-green-400' : someDown ? 'text-red-400' : 'text-yellow-400'
          }`}>
            {allUp
              ? 'All Systems Operational'
              : someDown
              ? 'Some Systems Down'
              : 'Checking Systems...'}
          </p>
        </div>

        {/* Endpoints */}
        <div className="space-y-4">
          {data.endpoints.length === 0 ? (
            <p className="text-gray-500 text-center py-10">No monitors configured yet.</p>
          ) : (
            data.endpoints.map(ep => {
              const uptime = ep.total_count > 0
                ? Math.round((ep.up_count / ep.total_count) * 100)
                : 0;

              return (
                <div
                  key={ep.id}
                  className="bg-gray-900 border border-gray-800 rounded-2xl p-5"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        ep.last_status === true
                          ? 'bg-green-400 animate-pulse'
                          : ep.last_status === false
                          ? 'bg-red-400'
                          : 'bg-gray-500'
                      }`} />
                      <div>
                        <p className="font-semibold text-white">{ep.name}</p>
                        <p className="text-gray-400 text-sm">{ep.url}</p>
                      </div>
                    </div>
                    <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                      ep.last_status === true
                        ? 'bg-green-900/40 text-green-400'
                        : ep.last_status === false
                        ? 'bg-red-900/40 text-red-400'
                        : 'bg-gray-800 text-gray-400'
                    }`}>
                      {ep.last_status === true ? 'Operational' : ep.last_status === false ? 'Down' : 'Pending'}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 mt-3">
                    <div className="bg-gray-800 rounded-xl p-3 text-center">
                      <p className="text-gray-400 text-xs mb-1">Uptime</p>
                      <p className={`text-lg font-bold ${uptime > 90 ? 'text-green-400' : 'text-red-400'}`}>
                        {uptime}%
                      </p>
                    </div>
                    <div className="bg-gray-800 rounded-xl p-3 text-center">
                      <p className="text-gray-400 text-xs mb-1">Response</p>
                      <p className="text-lg font-bold text-blue-400">
                        {ep.last_response_time ? `${ep.last_response_time}ms` : 'N/A'}
                      </p>
                    </div>
                    <div className="bg-gray-800 rounded-xl p-3 text-center">
                      <p className="text-gray-400 text-xs mb-1">Last Check</p>
                      <p className="text-lg font-bold text-white text-sm">
                        {ep.last_checked
                          ? new Date(ep.last_checked).toLocaleTimeString()
                          : 'Never'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-10">
          <p className="text-gray-600 text-sm">
            Powered by <span className="text-blue-400">🔔 PingMyAPI</span>
          </p>
        </div>
      </div>
    </div>
  );
}