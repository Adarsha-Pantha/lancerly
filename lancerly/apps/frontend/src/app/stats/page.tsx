import React from 'react';

export default function StatsPage() {
  const stats = [
    { label: 'Lines of Code', value: '15,420+', color: 'text-blue-400' },
    { label: 'Commits Today', value: '2', color: 'text-emerald-400' },
    { label: 'Project Health', value: '100%', color: 'text-purple-400' },
    { label: 'Uptime', value: '99.9%', color: 'text-pink-400' },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-4xl w-full">
        <div className="mb-12 text-center animate-in fade-in slide-in-from-top-10 duration-1000">
          <h1 className="text-6xl font-black tracking-tighter mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-400 to-gray-600">
            SYSTEM STATUS
          </h1>
          <p className="text-gray-500 uppercase tracking-[0.3em] font-semibold text-sm">
            Daily Repository Activity Report
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div 
              key={stat.label}
              style={{ animationDelay: `${i * 150}ms` }}
              className="group p-8 bg-[#0a0a0a] border border-white/5 rounded-3xl hover:border-white/20 transition-all duration-500 animate-in fade-in zoom-in"
            >
              <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-4 group-hover:text-gray-300 transition-colors">
                {stat.label}
              </p>
              <h2 className={`text-4xl font-mono font-bold ${stat.color} group-hover:scale-110 transition-transform duration-500`}>
                {stat.value}
              </h2>
            </div>
          ))}
        </div>

        <div className="mt-12 p-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl animate-pulse shadow-[0_0_50px_rgba(59,130,246,0.5)]">
          <div className="bg-[#050505] rounded-[22px] p-10 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-blue-500/10 to-transparent pointer-events-none" />
            <p className="text-2xl text-white font-medium mb-2">
              Daily Push Verification
            </p>
            <p className="text-gray-400 italic mb-6">
              "Consistency is the hallmark of progress."
            </p>
            <div className="flex items-center justify-center gap-6">
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]"></span>
                <span className="text-xs font-mono text-emerald-500 uppercase tracking-widest font-bold">
                  Connection Active
                </span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full">
                <span className="text-xs font-mono text-blue-500 uppercase tracking-widest font-bold">
                  Final Push Confirmed: 2026-03-19
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
