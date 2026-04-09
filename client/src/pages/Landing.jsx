import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

// Animated counter hook
function useCounter(end, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [end, duration, start]);
  return count;
}

// Intersection observer hook
function useInView() {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setInView(true);
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return [ref, inView];
}

const features = [
  { icon: '📡', title: 'Real-time Monitoring', desc: 'Ping any API endpoint every minute and get instant alerts when something breaks. Never be the last to know.', color: 'from-blue-500 to-cyan-500' },
  { icon: '🔍', title: 'Schema Drift Detection', desc: 'Detect when your API response shape changes — not just status codes. Catch breaking changes before your users do.', color: 'from-purple-500 to-pink-500' },
  { icon: '🤖', title: 'AI Anomaly Detection', desc: 'Groq-powered Llama 3 analyzes your response time patterns and flags degradation trends before they become outages.', color: 'from-orange-500 to-red-500' },
  { icon: '📊', title: 'Response Time Charts', desc: 'Beautiful charts showing your API performance over time. Spot slowdowns and spikes at a glance.', color: 'from-green-500 to-emerald-500' },
  { icon: '📧', title: 'Instant Email Alerts', desc: 'Get notified the moment your API goes down, returns unexpected status codes, or changes its response schema.', color: 'from-yellow-500 to-orange-500' },
  { icon: '🌐', title: 'Public Status Pages', desc: 'Share a beautiful public status page with your users. Show them your uptime and build trust in your product.', color: 'from-pink-500 to-rose-500' },
];

const steps = [
  { step: '01', title: 'Add Your API', desc: 'Register any API endpoint — just paste the URL, pick the method, and set your expected status code.', icon: '🔗' },
  { step: '02', title: 'We Monitor 24/7', desc: 'Our workers ping your API every minute, track response times, and snapshot the response schema automatically.', icon: '⚙️' },
  { step: '03', title: 'Get Alerted Instantly', desc: 'When something changes — downtime, slow response, schema drift — you get an email alert within 60 seconds.', icon: '🔔' },
  { step: '04', title: 'Analyze & Improve', desc: 'Use AI-powered insights and response time charts to understand patterns and optimize your APIs.', icon: '📈' },
];

const plans = [
  {
    name: 'Free', price: '$0', period: 'forever',
    color: 'border-gray-700',
    badge: null,
    features: ['3 API monitors', 'Email alerts', 'Public status page', '24hr log history', 'Schema drift detection'],
    cta: 'Get Started Free', ctaStyle: 'border border-gray-600 text-white hover:bg-gray-800',
  },
  {
    name: 'Pro', price: '$9', period: 'per month',
    color: 'border-blue-500',
    badge: 'Most Popular',
    features: ['25 API monitors', 'Email + Slack alerts', 'Custom status page domain', '30-day log history', 'AI anomaly detection', 'Multi-step API chains', 'Priority support'],
    cta: 'Start Free Trial', ctaStyle: 'bg-blue-600 hover:bg-blue-700 text-white',
  },
  {
    name: 'Team', price: '$29', period: 'per month',
    color: 'border-purple-500',
    badge: null,
    features: ['Unlimited monitors', 'All Pro features', 'Team members', '90-day log history', 'Webhook integrations', 'SLA reports', 'Dedicated support'],
    cta: 'Contact Sales', ctaStyle: 'border border-purple-500 text-purple-400 hover:bg-purple-900/20',
  },
];

const testimonials = [
  { name: 'Sarah K.', role: 'Backend Engineer', company: 'TechStartup', avatar: '👩‍💻', text: 'PingMyAPI caught a schema change in our payment API before any users noticed. Saved us from a major incident.' },
  { name: 'Raj M.', role: 'Full Stack Dev', company: 'FreelanceHub', avatar: '👨‍💻', text: 'The AI analysis feature is incredible. It told me my API was degrading 3 days before it actually went down.' },
  { name: 'Priya S.', role: 'DevOps Lead', company: 'CloudCo', avatar: '👩‍🔧', text: 'Finally a monitoring tool that checks more than just uptime. Schema drift detection is a game changer.' },
];

const faqs = [
  { q: 'How often does PingMyAPI check my endpoints?', a: 'Every minute by default. You can customize the interval from 1 to 60 minutes depending on how critical your API is.' },
  { q: 'What is schema drift detection?', a: 'When your API response shape changes — new fields added, fields removed, types changed — PingMyAPI detects it and alerts you. This catches breaking changes that status codes alone would miss.' },
  { q: 'How does the AI anomaly detection work?', a: 'We feed your last 20 ping results to Groq\'s Llama 3 model which analyzes response time trends, uptime patterns, and schema changes to identify degradation before it becomes an outage.' },
  { q: 'Can I make my status page public?', a: 'Yes! Every account gets a public status page at pingmyapi.com/status/your-id that you can share with your users or embed in your product.' },
  { q: 'Do I need a credit card to start?', a: 'No! The free plan is completely free, forever. No credit card required to get started.' },
];

export default function Landing() {
  const [statsRef, statsInView] = useInView();
  const [openFaq, setOpenFaq] = useState(null);
  const monitors = useCounter(10000, 2000, statsInView);
  const uptime = useCounter(99, 2000, statsInView);
  const alerts = useCounter(50000, 2000, statsInView);

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-x-hidden">

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950/80 backdrop-blur-md border-b border-gray-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="text-2xl font-bold text-white">🔔 PingMyAPI</span>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#how-it-works" className="hover:text-white transition">How it works</a>
            <a href="#pricing" className="hover:text-white transition">Pricing</a>
            <a href="#faq" className="hover:text-white transition">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-gray-400 hover:text-white transition px-4 py-2">
              Login
            </Link>
            <Link to="/register" className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition font-medium">
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 text-center relative">
        {/* Background gradient blobs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto relative">
          <div className="inline-flex items-center gap-2 bg-blue-900/30 border border-blue-700 text-blue-400 text-sm px-4 py-2 rounded-full mb-8">
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            Now with AI-powered anomaly detection
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
            Monitor your APIs.{' '}
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Before they break.
            </span>
          </h1>

          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            PingMyAPI monitors your API endpoints every minute, detects schema changes,
            analyzes performance with AI, and alerts you instantly — so you fix issues
            before your users notice.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link to="/register"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold text-lg transition shadow-lg shadow-blue-500/25">
              Start Monitoring Free →
            </Link>
            <a href="#how-it-works"
              className="border border-gray-700 text-gray-300 hover:border-gray-500 hover:text-white px-8 py-4 rounded-2xl font-medium text-lg transition">
              See How It Works
            </a>
          </div>

          {/* Hero Dashboard Preview */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 shadow-2xl shadow-black/50 text-left">
            <div className="flex items-center gap-2 mb-4 px-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-gray-500 text-sm ml-2">pingmyapi.com/dashboard</span>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[['Total Monitors', '3', 'text-white'], ['Active', '2', 'text-green-400'], ['Paused', '1', 'text-yellow-400']].map(([label, val, color]) => (
                <div key={label} className="bg-gray-800 rounded-xl p-3">
                  <p className="text-gray-400 text-xs">{label}</p>
                  <p className={`text-2xl font-bold ${color}`}>{val}</p>
                </div>
              ))}
            </div>
            {[
              { name: 'Payment API', url: 'api.stripe.com/v1/health', up: true, ms: '142ms' },
              { name: 'Auth Service', url: 'auth.myapp.com/ping', up: true, ms: '89ms' },
              { name: 'Analytics API', url: 'analytics.myapp.com/status', up: false, ms: '—' },
            ].map(ep => (
              <div key={ep.name} className="flex items-center justify-between bg-gray-800 rounded-xl px-4 py-3 mb-2">
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${ep.up ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
                  <div>
                    <p className="text-white text-sm font-medium">{ep.name}</p>
                    <p className="text-gray-500 text-xs">{ep.url}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 text-sm">{ep.ms}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${ep.up ? 'bg-green-900/40 text-green-400' : 'bg-red-900/40 text-red-400'}`}>
                    {ep.up ? 'Operational' : 'Down'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Animated Stats */}
      <section ref={statsRef} className="py-16 px-6 border-y border-gray-800 bg-gray-900/50">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8 text-center">
          <div>
            <p className="text-5xl font-black text-blue-400">{monitors.toLocaleString()}+</p>
            <p className="text-gray-400 mt-2">APIs Monitored</p>
          </div>
          <div>
            <p className="text-5xl font-black text-green-400">{uptime}.9%</p>
            <p className="text-gray-400 mt-2">Avg Uptime Detected</p>
          </div>
          <div>
            <p className="text-5xl font-black text-purple-400">{alerts.toLocaleString()}+</p>
            <p className="text-gray-400 mt-2">Alerts Sent</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Everything you need to{' '}
              <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                sleep at night
              </span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Most monitoring tools only check if your API is up. We go deeper.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-gray-600 transition group">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} mb-4 text-2xl`}>
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6 bg-gray-900/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Up and running in{' '}
              <span className="bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">
                2 minutes
              </span>
            </h2>
            <p className="text-gray-400 text-lg">No complex setup. No agent to install. Just paste your URL.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {steps.map((s, i) => (
              <div key={i} className="flex gap-5 bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-xl">
                    {s.icon}
                  </div>
                </div>
                <div>
                  <p className="text-blue-400 text-xs font-bold mb-1">STEP {s.step}</p>
                  <h3 className="text-white font-bold text-lg mb-2">{s.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Simple,{' '}
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                transparent pricing
              </span>
            </h2>
            <p className="text-gray-400 text-lg">Start free. Upgrade when you need more.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan, i) => (
              <div key={i} className={`bg-gray-900 border-2 ${plan.color} rounded-2xl p-6 relative ${plan.badge ? 'scale-105' : ''}`}>
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-full">
                    {plan.badge}
                  </div>
                )}
                <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-black text-white">{plan.price}</span>
                  <span className="text-gray-400 text-sm">/{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-gray-300">
                      <span className="text-green-400">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link to="/register"
                  className={`block text-center py-3 rounded-xl font-semibold transition ${plan.ctaStyle}`}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 bg-gray-900/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Loved by{' '}
              <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                developers
              </span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <p className="text-gray-300 text-sm leading-relaxed mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-xl">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{t.name}</p>
                    <p className="text-gray-400 text-xs">{t.role} · {t.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Frequently asked{' '}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                questions
              </span>
            </h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                <button
                  className="w-full text-left px-6 py-5 flex items-center justify-between"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="text-white font-semibold">{faq.q}</span>
                  <span className={`text-gray-400 text-xl transition-transform ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-gray-400 text-sm leading-relaxed border-t border-gray-800 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20 rounded-3xl" />
          <div className="relative">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Stop finding out from your users.
            </h2>
            <p className="text-white/80 text-lg mb-8">
              Join thousands of developers who monitor their APIs with PingMyAPI.
            </p>
            <Link to="/register"
              className="inline-block bg-white text-blue-600 font-bold px-10 py-4 rounded-2xl text-lg hover:bg-gray-100 transition shadow-xl">
              Start Monitoring Free →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div>
              <p className="text-white font-bold text-lg mb-4">🔔 PingMyAPI</p>
              <p className="text-gray-400 text-sm leading-relaxed">
                API monitoring with schema drift detection and AI-powered insights.
              </p>
            </div>
            <div>
              <p className="text-white font-semibold mb-4">Product</p>
              <div className="space-y-2">
                {['Features', 'Pricing', 'Changelog', 'Roadmap'].map(item => (
                  <p key={item} className="text-gray-400 text-sm hover:text-white cursor-pointer transition">{item}</p>
                ))}
              </div>
            </div>
            <div>
              <p className="text-white font-semibold mb-4">Resources</p>
              <div className="space-y-2">
                {['Documentation', 'API Reference', 'Blog', 'Status'].map(item => (
                  <p key={item} className="text-gray-400 text-sm hover:text-white cursor-pointer transition">{item}</p>
                ))}
              </div>
            </div>
            <div>
              <p className="text-white font-semibold mb-4">Company</p>
              <div className="space-y-2">
                {['About', 'Privacy Policy', 'Terms of Service', 'Contact'].map(item => (
                  <p key={item} className="text-gray-400 text-sm hover:text-white cursor-pointer transition">{item}</p>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">© 2026 PingMyAPI. Built with ❤️ by Aniket Udgirkar</p>
            <div className="flex items-center gap-6">
              <a href="https://github.com/aniket2832" target="_blank" rel="noopener noreferrer"
                className="text-gray-400 hover:text-white text-sm transition">GitHub</a>
              <a href="https://www.linkedin.com/in/aniket-udgirkar/" target="_blank" rel="noopener noreferrer"
                className="text-gray-400 hover:text-white text-sm transition">LinkedIn</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}