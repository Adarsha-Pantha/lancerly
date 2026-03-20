"use client";

import React from 'react';

export default function ActivityLogPage() {
  const activities = [
    { date: '2026-03-20', task: 'Daily Activity Log Implementation', status: 'Completed', detail: 'Created premium glassmorphic layout' },
    { date: '2026-03-19', task: 'System Status Dashboard', status: 'Completed', detail: 'Identity cleanup and force-push' },
    { date: '2026-03-18', task: 'Initial Example Page', status: 'Completed', detail: 'Push demonstration established' }
  ];

  return (
    <div className="min-h-screen bg-[#02040a] text-white p-8 font-sans selection:bg-blue-500/30">
      <div className="max-w-4xl mx-auto space-y-12">
        <header className="border-b border-gray-800 pb-8">
          <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent mb-4">
            Development Activity Log
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl">
            Real-time tracking of repository progress and daily contributions.
          </p>
        </header>

        <div className="grid gap-6">
          {activities.map((item, index) => (
            <div 
              key={index} 
              className="group relative p-[1px] rounded-2xl bg-gradient-to-r from-gray-800 to-transparent hover:from-emerald-500/50 hover:to-blue-500/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(16,185,129,0.1)]"
            >
              <div className="bg-[#0d1117]/95 backdrop-blur-xl rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
                   <div className="w-20 h-20 bg-emerald-500/20 rounded-full blur-3xl"></div>
                </div>
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-mono text-emerald-500 uppercase tracking-widest font-bold mb-2 block">
                      {item.date}
                    </span>
                    <h3 className="text-xl font-semibold text-gray-100 group-hover:text-emerald-400 transition-colors">
                      {item.task}
                    </h3>
                    <p className="text-gray-400 mt-1 italic">
                      "{item.detail}"
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs font-bold text-emerald-500 uppercase tracking-tighter">
                      {item.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <footer className="mt-16 pt-8 border-t border-gray-900 flex justify-between items-center text-gray-500 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Live Sync: March 20, 2026</span>
          </div>
          <div className="font-mono opacity-50">
            Commit ID: e880e96...
          </div>
        </footer>
      </div>
    </div>
  );
}
