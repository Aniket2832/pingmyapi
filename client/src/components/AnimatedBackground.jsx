export default function AnimatedBackground({ variant = 'blue' }) {
  const colors = {
    blue: {
      blob1: 'bg-blue-600/20',
      blob2: 'bg-purple-600/15',
      blob3: 'bg-cyan-600/10',
      grid: 'rgba(59,130,246,0.03)',
      particles: ['bg-blue-400/30', 'bg-purple-400/20', 'bg-cyan-400/25'],
    },
    purple: {
      blob1: 'bg-purple-600/20',
      blob2: 'bg-pink-600/15',
      blob3: 'bg-blue-600/10',
      grid: 'rgba(147,51,234,0.03)',
      particles: ['bg-purple-400/30', 'bg-pink-400/20', 'bg-blue-400/25'],
    },
    green: {
      blob1: 'bg-green-600/15',
      blob2: 'bg-blue-600/15',
      blob3: 'bg-purple-600/10',
      grid: 'rgba(34,197,94,0.03)',
      particles: ['bg-green-400/30', 'bg-blue-400/20', 'bg-purple-400/25'],
    },
  };

  const c = colors[variant];

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">

      {/* Animated grid */}
      <div className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(${c.grid} 1px, transparent 1px),
            linear-gradient(90deg, ${c.grid} 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          animation: 'grid-move 8s linear infinite',
        }}
      />

      {/* Large blobs */}
      <div className={`absolute -top-40 -left-40 w-96 h-96 ${c.blob1} rounded-full blur-3xl animate-pulse-slow`} />
      <div className={`absolute top-1/3 -right-40 w-80 h-80 ${c.blob2} rounded-full blur-3xl animate-pulse-slow`}
        style={{ animationDelay: '2s' }} />
      <div className={`absolute -bottom-40 left-1/3 w-96 h-96 ${c.blob3} rounded-full blur-3xl animate-pulse-slow`}
        style={{ animationDelay: '4s' }} />

      {/* Medium drifting blobs */}
      <div className={`absolute top-1/4 left-1/4 w-48 h-48 ${c.blob2} rounded-full blur-2xl animate-drift`} />
      <div className={`absolute bottom-1/4 right-1/4 w-64 h-64 ${c.blob1} rounded-full blur-2xl animate-drift-slow`} />

      {/* Floating particles */}
      {[
        { size: 'w-2 h-2', top: '15%', left: '10%', color: c.particles[0], delay: '0s', dur: '2s' },
{ size: 'w-1.5 h-1.5', top: '25%', left: '80%', color: c.particles[1], delay: '0.3s', dur: '2.5s' },
{ size: 'w-3 h-3', top: '60%', left: '15%', color: c.particles[2], delay: '0.6s', dur: '2s' },
{ size: 'w-2 h-2', top: '75%', left: '70%', color: c.particles[0], delay: '0.9s', dur: '3s' },
{ size: 'w-1.5 h-1.5', top: '40%', left: '90%', color: c.particles[1], delay: '0.2s', dur: '2s' },
{ size: 'w-2.5 h-2.5', top: '85%', left: '40%', color: c.particles[2], delay: '0.5s', dur: '2.5s' },
{ size: 'w-1 h-1', top: '10%', left: '55%', color: c.particles[0], delay: '0.8s', dur: '2s' },
{ size: 'w-2 h-2', top: '50%', left: '5%', color: c.particles[1], delay: '1s', dur: '3s' },
      ].map((p, i) => (
        <div
          key={i}
          className={`absolute ${p.size} ${p.color} rounded-full`}
          style={{
            top: p.top, left: p.left,
            animation: `float ${p.dur} ease-in-out infinite ${p.delay}`,
          }}
        />
      ))}

      {/* Glowing orbs */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-screen ${c.blob1} blur-sm opacity-20`} />

      {/* Corner accents */}
      <div className={`absolute top-0 right-0 w-32 h-32 ${c.blob1} blur-2xl opacity-40`} />
      <div className={`absolute bottom-0 left-0 w-32 h-32 ${c.blob2} blur-2xl opacity-40`} />
    </div>
  );
}