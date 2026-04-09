import { useState } from 'react';
import api from '../api/axios';

export default function ChainCard({ chain, onRefresh }) {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [showLogs, setShowLogs] = useState(false);
  const [logs, setLogs] = useState([]);

  const handleRun = async () => {
    setRunning(true);
    setResult(null);
    try {
      const res = await api.post(`/chains/${chain.id}/run`);
      setResult(res.data);
      onRefresh();
    } catch (err) {
      setResult({ success: false, error_message: 'Failed to run chain' });
    } finally {
      setRunning(false);
    }
  };

  const handleLogs = async () => {
    const res = await api.get(`/chains/${chain.id}/logs`);
    setLogs(res.data);
    setShowLogs(true);
  };

  const handleDelete = async () => {
    if (!confirm('Delete this chain?')) return;
    await api.delete(`/chains/${chain.id}`);
    onRefresh();
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-gray-600 transition">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${
            chain.last_status === true ? 'bg-green-400 animate-pulse' :
            chain.last_status === false ? 'bg-red-400' : 'bg-gray-500'
          }`} />
          <div>
            <p className="font-semibold text-white">⛓️ {chain.name}</p>
            <p className="text-gray-500 text-xs mt-0.5">
              {chain.last_run
                ? `Last run: ${new Date(chain.last_run).toLocaleTimeString()}`
                : 'Never run'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-xs px-3 py-1 rounded-full font-medium ${
            chain.last_status === true ? 'bg-green-900/40 text-green-400' :
            chain.last_status === false ? 'bg-red-900/40 text-red-400' :
            'bg-gray-800 text-gray-400'
          }`}>
            {chain.last_status === true ? 'Passed' :
             chain.last_status === false ? 'Failed' : 'Not run'}
          </span>
          <button onClick={handleRun} disabled={running}
            className="text-sm text-blue-400 hover:text-blue-300 border border-blue-800 px-3 py-1.5 rounded-lg transition disabled:opacity-50">
            {running ? '⏳ Running...' : '▶ Run'}
          </button>
          <button onClick={handleLogs}
            className="text-sm text-purple-400 hover:text-purple-300 border border-purple-800 px-3 py-1.5 rounded-lg transition">
            Logs
          </button>
          <button onClick={handleDelete}
            className="text-sm text-red-400 hover:text-red-300 border border-red-800 px-3 py-1.5 rounded-lg transition">
            Delete
          </button>
        </div>
      </div>

      {/* Run Result */}
      {result && (
        <div className={`rounded-xl p-4 mt-2 border ${
          result.success
            ? 'bg-green-900/20 border-green-800'
            : 'bg-red-900/20 border-red-800'
        }`}>
          <div className="flex items-center gap-2 mb-3">
            <span>{result.success ? '✅' : '❌'}</span>
            <span className={`font-semibold ${result.success ? 'text-green-400' : 'text-red-400'}`}>
              {result.success ? 'All steps passed!' : `Failed at step ${result.failed_step}`}
            </span>
            <span className="text-gray-400 text-sm ml-auto">{result.total_time_ms}ms total</span>
          </div>

          {result.step_results?.map((step, i) => (
            <div key={i} className={`flex items-center justify-between py-2 border-t border-gray-700 text-sm`}>
              <div className="flex items-center gap-2">
                <span>{step.success ? '✅' : '❌'}</span>
                <span className="text-gray-300">{step.name}</span>
                {step.extracted && (
                  <span className="text-yellow-400 text-xs bg-yellow-900/20 px-2 py-0.5 rounded-full">
                    📤 {Object.keys(step.extracted)[0]} extracted
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-gray-400">
                <span>HTTP {step.status_code}</span>
                <span>{step.response_time_ms}ms</span>
              </div>
            </div>
          ))}

          {result.error_message && (
            <p className="text-red-400 text-sm mt-2">⚠️ {result.error_message}</p>
          )}
        </div>
      )}

      {/* Logs Modal */}
      {showLogs && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          onClick={() => setShowLogs(false)}>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-2xl"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">⛓️ Chain Logs — {chain.name}</h2>
              <button onClick={() => setShowLogs(false)} className="text-gray-400 hover:text-white text-xl">✕</button>
            </div>
            {logs.length === 0 ? (
              <p className="text-gray-500">No runs yet.</p>
            ) : (
              <div className="space-y-3">
                {logs.map(log => (
                  <div key={log.id} className={`border rounded-xl p-4 ${
                    log.success ? 'border-green-900 bg-green-900/10' : 'border-red-900 bg-red-900/10'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`font-semibold text-sm ${log.success ? 'text-green-400' : 'text-red-400'}`}>
                        {log.success ? '✅ Passed' : `❌ Failed at step ${log.failed_step}`}
                      </span>
                      <div className="flex items-center gap-3 text-gray-400 text-sm">
                        <span>{log.total_time_ms}ms</span>
                        <span>{new Date(log.ran_at).toLocaleString()}</span>
                      </div>
                    </div>
                    {log.error_message && (
                      <p className="text-red-400 text-xs">{log.error_message}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}