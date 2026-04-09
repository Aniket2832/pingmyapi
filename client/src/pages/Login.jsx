import AnimatedBackground from '../components/AnimatedBackground';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const features = [
  { icon: '📡', text: 'Monitor APIs every minute' },
  { icon: '🔍', text: 'Schema drift detection' },
  { icon: '🤖', text: 'AI anomaly detection' },
  { icon: '📧', text: 'Instant email alerts' },
  { icon: '🌐', text: 'Public status pages' },
  { icon: '⛓️', text: 'Multi-step API chains' },
];

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      login(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
     <div className="min-h-screen bg-gray-950 flex relative">
    <AnimatedBackground variant="blue" />


      {/* Left Panel */}
    <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gradient-to-br from-gray-900/80 via-blue-950/50 to-gray-900/80 p-12 border-r border-gray-800 relative z-10 overflow-hidden backdrop-blur-sm">
        {/* Background blobs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-3xl font-black text-white">🔔 PingMyAPI</span>
          </Link>
          <p className="text-gray-400 mt-2">API monitoring that actually works</p>
        </div>

        <div className="relative space-y-6">
          <h2 className="text-4xl font-black text-white leading-tight">
            Know before{' '}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              your users do.
            </span>
          </h2>
          <p className="text-gray-400 leading-relaxed">
            PingMyAPI monitors your APIs 24/7, detects schema changes,
            and alerts you the moment something breaks.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-2 bg-gray-800/50 rounded-xl px-4 py-3">
                <span>{f.icon}</span>
                <span className="text-gray-300 text-sm">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="flex items-center gap-4 bg-gray-800/50 rounded-2xl p-4">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-lg">👨‍💻</div>
            <div>
              <p className="text-white text-sm font-semibold">"Caught a breaking API change before users noticed!"</p>
              <p className="text-gray-400 text-xs mt-1">— Raj M., Full Stack Developer</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
    <div className="flex-1 flex items-center justify-center px-6 py-12 relative z-10">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="text-2xl font-black text-white">🔔 PingMyAPI</Link>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-black text-white mb-2">Welcome back</h1>
            <p className="text-gray-400">Sign in to your account to continue monitoring</p>
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 rounded-xl text-sm mb-6">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-gray-400 text-sm mb-1.5 block">Email address</label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full bg-gray-900 text-white px-4 py-3.5 rounded-xl border border-gray-700 focus:outline-none focus:border-blue-500 transition"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-1.5 block">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-gray-900 text-white px-4 py-3.5 rounded-xl border border-gray-700 focus:outline-none focus:border-blue-500 transition"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-blue-500/20"
            >
              {loading ? '⏳ Signing in...' : 'Sign in →'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-gray-900 border border-gray-800 rounded-xl">
            <p className="text-gray-400 text-xs text-center mb-3">Trusted by developers worldwide</p>
            <div className="grid grid-cols-3 gap-3 text-center">
              {[['10K+', 'APIs Monitored'], ['99.9%', 'Uptime'], ['50K+', 'Alerts Sent']].map(([val, label]) => (
                <div key={label}>
                  <p className="text-blue-400 font-bold text-sm">{val}</p>
                  <p className="text-gray-500 text-xs">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-gray-400 text-center mt-6 text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-400 hover:text-blue-300 font-semibold transition">
              Create one free →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}