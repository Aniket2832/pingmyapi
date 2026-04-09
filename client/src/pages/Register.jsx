import AnimatedBackground from '../components/AnimatedBackground';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const steps = [
  { icon: '🔗', title: 'Add your API', desc: 'Paste any endpoint URL' },
  { icon: '⚙️', title: 'We monitor 24/7', desc: 'Ping every minute automatically' },
  { icon: '🔔', title: 'Get alerted', desc: 'Email within 60 seconds' },
];

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/register', form);
      login(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex relative">
  <AnimatedBackground variant="purple" />

      {/* Left Panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gradient-to-br from-gray-900 via-purple-950 to-gray-900 p-12 border-r border-gray-800 relative z-10 overflow-hidden">
        <div className="absolute top-20 right-10 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-3xl font-black text-white">🔔 PingMyAPI</span>
          </Link>
          <p className="text-gray-400 mt-2">Free forever. No credit card required.</p>
        </div>

        <div className="relative space-y-8">
          <h2 className="text-4xl font-black text-white leading-tight">
            Start monitoring{' '}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              in 2 minutes.
            </span>
          </h2>

          <div className="space-y-4">
            {steps.map((s, i) => (
              <div key={i} className="flex items-center gap-4 bg-gray-800/50 rounded-2xl p-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-xl flex-shrink-0">
                  {s.icon}
                </div>
                <div>
                  <p className="text-white font-semibold">{s.title}</p>
                  <p className="text-gray-400 text-sm">{s.desc}</p>
                </div>
                <span className="ml-auto text-gray-600 font-bold">0{i + 1}</span>
              </div>
            ))}
          </div>

          {/* Free plan highlight */}
          <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-blue-800 rounded-2xl p-5">
            <p className="text-blue-400 font-bold mb-2">🎁 Free plan includes:</p>
            <div className="grid grid-cols-2 gap-2">
              {['3 API monitors', 'Email alerts', 'Public status page', 'Schema detection'].map(f => (
                <div key={f} className="flex items-center gap-1.5 text-gray-300 text-sm">
                  <span className="text-green-400">✓</span> {f}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative text-gray-500 text-sm">
          Already monitoring with us? <Link to="/login" className="text-blue-400 hover:underline">Sign in</Link>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative z-10">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="text-2xl font-black text-white">🔔 PingMyAPI</Link>
          </div>

          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-green-900/30 border border-green-700 text-green-400 text-xs px-3 py-1.5 rounded-full mb-4">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              Free forever · No credit card
            </div>
            <h1 className="text-3xl font-black text-white mb-2">Create your account</h1>
            <p className="text-gray-400">Join thousands of developers monitoring their APIs</p>
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 rounded-xl text-sm mb-6">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-gray-400 text-sm mb-1.5 block">Full name</label>
              <input
                type="text"
                placeholder="Aniket Udgirkar"
                className="w-full bg-gray-900 text-white px-4 py-3.5 rounded-xl border border-gray-700 focus:outline-none focus:border-purple-500 transition"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-1.5 block">Email address</label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full bg-gray-900 text-white px-4 py-3.5 rounded-xl border border-gray-700 focus:outline-none focus:border-purple-500 transition"
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
                className="w-full bg-gray-900 text-white px-4 py-3.5 rounded-xl border border-gray-700 focus:outline-none focus:border-purple-500 transition"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition shadow-lg"
            >
              {loading ? '⏳ Creating account...' : 'Create free account →'}
            </button>
          </form>

          <p className="text-gray-500 text-xs text-center mt-4">
            By signing up you agree to our Terms of Service and Privacy Policy
          </p>

          <p className="text-gray-400 text-center mt-6 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 font-semibold transition">
              Sign in →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}