import { useState, useEffect } from 'react';
import api from '../api/axios';

function diffObjects(prev, curr, path = '') {
  const changes = [];
  const allKeys = new Set([...Object.keys(prev || {}), ...Object.keys(curr || {})]);

  for (const key of allKeys) {
    const fullPath = path ? `${path}.${key}` : key;
    const prevVal = prev?.[key];
    const currVal = curr?.[key];

    if (!(key in (prev || {}))) {
      changes.push({ type: 'added', path: fullPath, value: currVal });
    } else if (!(key in (curr || {}))) {
      changes.push({ type: 'removed', path: fullPath, value: prevVal });
    } else if (typeof prevVal === 'object' && typeof currVal === 'object'
      && prevVal !== null && currVal !== null) {
      changes.push(...diffObjects(prevVal, currVal, fullPath));
    } else if (JSON.stringify(prevVal) !== JSON.stringify(currVal)) {
      changes.push({ type: 'changed', path: fullPath, from: prevVal, to: currVal });
    }
  }
  return changes;
}

export default function DiffModal({ endpoint, onClose }) {
  const [diff, setDiff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('diff'); // 'diff' | 'raw'

  useEffect(() => {
    api.get(`/endpoints/${endpoint.id}/diff`)
      .then(res => setDiff(res.data))
      .finally(() => setLoading(false));
  }, [endpoint.id]);

  const changes = diff?.hasDiff
    ? diffObjects(diff.previous.raw, diff.current.raw)
    : [];

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-3xl shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">🔍 Schema Diff — {endpoint.name}</h2>
            <p className="text-gray-400 text-sm mt-1">What changed in your API response</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">✕</button>
        </div>

        {loading ? (
          <p className="text-gray-400">Analyzing changes...</p>
        ) : !diff?.hasDiff ? (
          <div className="text-center py-16 text-gray-500">
            <p className="text-4xl mb-4">✅</p>
            <p>No schema changes detected yet.</p>
            <p className="text-sm mt-2">Changes will appear here when your API response shape shifts.</p>
          </div>
        ) : (
          <>
            {/* Timestamps */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-red-900/20 border border-red-900 rounded-xl p-3">
                <p className="text-red-400 text-xs font-semibold mb-1">PREVIOUS SNAPSHOT</p>
                <p className="text-gray-300 text-sm">{new Date(diff.previous.capturedAt).toLocaleString()}</p>
              </div>
              <div className="bg-green-900/20 border border-green-900 rounded-xl p-3">
                <p className="text-green-400 text-xs font-semibold mb-1">CURRENT SNAPSHOT</p>
                <p className="text-gray-300 text-sm">{new Date(diff.current.capturedAt).toLocaleString()}</p>
              </div>
            </div>

            {/* Tab Toggle */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setView('diff')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${view === 'diff' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
              >
                Changes ({changes.length})
              </button>
              <button
                onClick={() => setView('raw')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${view === 'raw' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
              >
                Raw JSON
              </button>
            </div>

            {/* Diff View */}
            {view === 'diff' && (
              <div className="space-y-2">
                {changes.length === 0 ? (
                  <p className="text-gray-400 text-sm">Schema structure is the same — value types may have changed.</p>
                ) : (
                  changes.map((change, i) => (
                    <div key={i} className={`rounded-xl p-4 border font-mono text-sm
                      ${change.type === 'added' ? 'bg-green-900/20 border-green-900' :
                        change.type === 'removed' ? 'bg-red-900/20 border-red-900' :
                        'bg-yellow-900/20 border-yellow-900'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full
                          ${change.type === 'added' ? 'bg-green-500/20 text-green-400' :
                            change.type === 'removed' ? 'bg-red-500/20 text-red-400' :
                            'bg-yellow-500/20 text-yellow-400'}`}>
                          {change.type === 'added' ? '+ ADDED' :
                           change.type === 'removed' ? '- REMOVED' : '~ CHANGED'}
                        </span>
                        <span className="text-blue-400">{change.path}</span>
                      </div>
                      {change.type === 'changed' && (
                        <div className="space-y-1">
                          <p className="text-red-400">- {JSON.stringify(change.from)}</p>
                          <p className="text-green-400">+ {JSON.stringify(change.to)}</p>
                        </div>
                      )}
                      {change.type === 'added' && (
                        <p className="text-green-400">+ {JSON.stringify(change.value)}</p>
                      )}
                      {change.type === 'removed' && (
                        <p className="text-red-400">- {JSON.stringify(change.value)}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Raw JSON View */}
            {view === 'raw' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-red-400 text-xs font-semibold mb-2">PREVIOUS</p>
                  <pre className="bg-gray-800 rounded-xl p-4 text-xs text-gray-300 overflow-auto max-h-80">
                    {JSON.stringify(diff.previous.raw, null, 2)}
                  </pre>
                </div>
                <div>
                  <p className="text-green-400 text-xs font-semibold mb-2">CURRENT</p>
                  <pre className="bg-gray-800 rounded-xl p-4 text-xs text-gray-300 overflow-auto max-h-80">
                    {JSON.stringify(diff.current.raw, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}