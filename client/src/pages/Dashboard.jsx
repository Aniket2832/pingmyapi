import AnimatedBackground from '../components/AnimatedBackground';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import EndpointCard from '../components/EndpointCard';
import AddEndpointModal from '../components/AddEndpointModal';
import ChainCard from '../components/ChainCard';
import AddChainModal from '../components/AddChainModal';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [endpoints, setEndpoints] = useState([]);
  const [chains, setChains] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showChainModal, setShowChainModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('monitors');

  const fetchEndpoints = async () => {
    try {
      const res = await api.get('/endpoints');
      setEndpoints(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchChains = async () => {
    try {
      const res = await api.get('/chains');
      setChains(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchEndpoints();
    fetchChains();
    const interval = setInterval(() => {
      fetchEndpoints();
      fetchChains();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const totalUp = endpoints.filter(e => e.is_active).length;
  const totalDown = endpoints.length - totalUp;
  const allUp = endpoints.length > 0 && totalDown === 0;

  return (
    <div className="min-h-screen bg-gray-950 text-white relative">
  <AnimatedBackground variant="green" />

      {/* Navbar */}
      <nav className="sticky top-0 z-40 border-b border-gray-800 bg-gray-950/90 backdrop-blur-md px-6 py-4 relative z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <span className="text-xl font-black text-white">🔔 PingMyAPI</span>
            <div className="hidden md:flex items-center gap-1">
              {[
                { id: 'monitors', label: '📡 Monitors', count: endpoints.length },
                { id: 'chains', label: '⛓️ Chains', count: chains.length },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2
                    ${activeTab === tab.id
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'}`}
                >
                  {tab.label}
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    activeTab === tab.id ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'
                  }`}>{tab.count}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={`/status/${user?.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-2 text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-3 py-2 rounded-lg transition"
            >
              🌐 Status Page
            </a>
            <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 px-3 py-2 rounded-lg">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-xs font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm text-gray-300 hidden md:block">{user?.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-3 py-2 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8 relative z-10">

        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-900/30 via-purple-900/20 to-gray-900 border border-gray-800 rounded-2xl p-6 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-white mb-1">
                Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]}! 👋
              </h1>
              <p className="text-gray-400">
                {endpoints.length === 0
                  ? "You have no monitors yet — add your first API to get started!"
                  : allUp
                  ? `All ${endpoints.length} monitors are running smoothly ✅`
                  : `${totalDown} monitor${totalDown > 1 ? 's' : ''} need${totalDown === 1 ? 's' : ''} your attention ⚠️`}
              </p>
            </div>
            <div className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-xl border ${
              endpoints.length === 0
                ? 'bg-gray-800 border-gray-700 text-gray-400'
                : allUp
                ? 'bg-green-900/30 border-green-800 text-green-400'
                : 'bg-red-900/30 border-red-800 text-red-400'
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                endpoints.length === 0 ? 'bg-gray-500' : allUp ? 'bg-green-400 animate-pulse' : 'bg-red-400 animate-pulse'
              }`} />
              <span className="text-sm font-semibold">
                {endpoints.length === 0 ? 'No monitors' : allUp ? 'All systems go' : 'Issues detected'}
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Monitors', value: endpoints.length, color: 'text-white', icon: '📡', bg: 'from-gray-800 to-gray-900' },
            { label: 'Active', value: totalUp, color: 'text-green-400', icon: '✅', bg: 'from-green-900/30 to-gray-900' },
            { label: 'Paused', value: totalDown, color: 'text-yellow-400', icon: '⏸️', bg: 'from-yellow-900/20 to-gray-900' },
            { label: 'API Chains', value: chains.length, color: 'text-purple-400', icon: '⛓️', bg: 'from-purple-900/30 to-gray-900' },
          ].map((stat, i) => (
            <div key={i} className={`bg-gradient-to-br ${stat.bg} border border-gray-800 rounded-2xl p-5`}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-400 text-sm">{stat.label}</p>
                <span className="text-xl">{stat.icon}</span>
              </div>
              <p className={`text-4xl font-black ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'monitors' && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-white">Your Monitors</h2>
                <p className="text-gray-400 text-sm mt-0.5">APIs being pinged every minute</p>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition flex items-center gap-2"
              >
                <span>+</span> Add Monitor
              </button>
            </div>

            {loading ? (
              <div className="text-center py-20">
                <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-gray-400">Loading monitors...</p>
              </div>
            ) : endpoints.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-gray-800 rounded-2xl">
                <p className="text-6xl mb-4">📡</p>
                <p className="text-xl font-bold text-white mb-2">No monitors yet</p>
                <p className="text-gray-400 mb-6">Add your first API endpoint to start monitoring</p>
                <button
                  onClick={() => setShowModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition"
                >
                  + Add Your First Monitor
                </button>

                {/* Quick start guide */}
                <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto text-left">
                  {[
                    { step: '1', title: 'Add an endpoint', desc: 'Paste your API URL and configure the expected response' },
                    { step: '2', title: 'We start pinging', desc: 'Our worker hits your API every minute automatically' },
                    { step: '3', title: 'Get notified', desc: 'Email alerts when something breaks or changes' },
                  ].map(s => (
                    <div key={s.step} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                      <div className="w-7 h-7 rounded-lg bg-blue-600 text-white text-xs font-bold flex items-center justify-center mb-3">{s.step}</div>
                      <p className="text-white font-semibold text-sm mb-1">{s.title}</p>
                      <p className="text-gray-400 text-xs">{s.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {endpoints.map(ep => (
                  <EndpointCard key={ep.id} endpoint={ep} onRefresh={fetchEndpoints} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'chains' && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-white">API Chains</h2>
                <p className="text-gray-400 text-sm mt-0.5">Multi-step API flows monitored end-to-end</p>
              </div>
              <button
                onClick={() => setShowChainModal(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl font-medium transition flex items-center gap-2"
              >
                <span>+</span> Create Chain
              </button>
            </div>

            {chains.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-gray-800 rounded-2xl">
                <p className="text-6xl mb-4">⛓️</p>
                <p className="text-xl font-bold text-white mb-2">No chains yet</p>
                <p className="text-gray-400 mb-6">Create a multi-step API flow to monitor end-to-end journeys</p>
                <button
                  onClick={() => setShowChainModal(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-medium transition"
                >
                  + Create Your First Chain
                </button>

                <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto text-left">
                  {[
                    { icon: '🔐', title: 'Step 1: Login', desc: 'POST /auth/login → extract token' },
                    { icon: '👤', title: 'Step 2: Get Profile', desc: 'GET /user/profile with {{token}}' },
                    { icon: '📦', title: 'Step 3: Get Orders', desc: 'GET /orders → verify response' },
                  ].map(s => (
                    <div key={s.title} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                      <span className="text-2xl mb-3 block">{s.icon}</span>
                      <p className="text-white font-semibold text-sm mb-1">{s.title}</p>
                      <p className="text-gray-400 text-xs font-mono">{s.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {chains.map(chain => (
                  <ChainCard key={chain.id} chain={chain} onRefresh={fetchChains} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <AddEndpointModal onClose={() => setShowModal(false)} onAdded={fetchEndpoints} />
      )}
      {showChainModal && (
        <AddChainModal onClose={() => setShowChainModal(false)} onAdded={fetchChains} />
      )}
    </div>
  );
}