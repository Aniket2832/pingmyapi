import { useState } from 'react';
import api from '../api/axios';

const emptyStep = (order) => ({
  step_order: order,
  name: '',
  url: '',
  method: 'GET',
  expected_status: 200,
  headers: {},
  body: {},
  extract_variable: '',
  extract_path: '',
});

export default function AddChainModal({ onClose, onAdded }) {
  const [name, setName] = useState('');
  const [steps, setSteps] = useState([emptyStep(1)]);
  const [error, setError] = useState('');

  const addStep = () => setSteps([...steps, emptyStep(steps.length + 1)]);

  const removeStep = (index) => {
    const updated = steps.filter((_, i) => i !== index)
      .map((s, i) => ({ ...s, step_order: i + 1 }));
    setSteps(updated);
  };

  const updateStep = (index, field, value) => {
    const updated = [...steps];
    updated[index] = { ...updated[index], [field]: value };
    setSteps(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/chains', { name, steps });
      onAdded();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create chain');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">⛓️ Create API Chain</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">✕</button>
        </div>

        {error && <p className="text-red-400 text-sm mb-4 bg-red-900/20 p-3 rounded-lg">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            placeholder="Chain name (e.g. Login → Get Profile → Get Orders)"
            className="w-full bg-gray-800 text-white px-4 py-3 rounded-xl border border-gray-700 focus:outline-none focus:border-blue-500"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />

          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={index} className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-blue-400 text-sm font-bold">Step {step.step_order}</span>
                  {steps.length > 1 && (
                    <button type="button" onClick={() => removeStep(index)}
                      className="text-red-400 hover:text-red-300 text-sm">Remove</button>
                  )}
                </div>

                <div className="space-y-3">
                  <input
                    type="text" placeholder="Step name (e.g. Login)"
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 text-sm"
                    value={step.name}
                    onChange={e => updateStep(index, 'name', e.target.value)}
                    required
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <select
                      className="bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none text-sm"
                      value={step.method}
                      onChange={e => updateStep(index, 'method', e.target.value)}
                    >
                      {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map(m => (
                        <option key={m}>{m}</option>
                      ))}
                    </select>
                    <input
                      type="text" placeholder="https://api.example.com/login"
                      className="col-span-2 bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none text-sm"
                      value={step.url}
                      onChange={e => updateStep(index, 'url', e.target.value)}
                      required
                    />
                  </div>
                  <input
                    type="number" placeholder="Expected status code"
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none text-sm"
                    value={step.expected_status}
                    onChange={e => updateStep(index, 'expected_status', parseInt(e.target.value))}
                  />

                  {/* Variable extraction */}
                  <div className="border-t border-gray-600 pt-3">
                    <p className="text-gray-400 text-xs mb-2">
                      📤 Extract from response (optional — use in next steps as {`{{variable}}`})
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text" placeholder="Variable name (e.g. token)"
                        className="bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none text-sm"
                        value={step.extract_variable}
                        onChange={e => updateStep(index, 'extract_variable', e.target.value)}
                      />
                      <input
                        type="text" placeholder="JSON path (e.g. data.token)"
                        className="bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none text-sm"
                        value={step.extract_path}
                        onChange={e => updateStep(index, 'extract_path', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button type="button" onClick={addStep}
            className="w-full border border-dashed border-gray-600 text-gray-400 hover:border-blue-500 hover:text-blue-400 py-3 rounded-xl text-sm transition">
            + Add Step
          </button>

          <div className="flex gap-3">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-700 text-gray-400 py-3 rounded-xl hover:border-gray-500 transition">
              Cancel
            </button>
            <button type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium transition">
              Create Chain
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}