import React from 'react';

export default function ExamplePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20 animate-in fade-in zoom-in duration-700">
        <h1 className="text-5xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
          Success!
        </h1>
        <p className="text-xl text-gray-300 leading-relaxed mb-8">
          This page was created to demonstrate a successful code push to your repository. 
          The modern design uses a glassmorphism effect with a vibrant gradient background.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300 cursor-default">
            <h3 className="text-blue-400 font-bold mb-2">Frontend</h3>
            <p className="text-sm text-gray-400 font-mono italic">Next.js + Tailwind CSS</p>
          </div>
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300 cursor-default">
            <h3 className="text-emerald-400 font-bold mb-2">Backend</h3>
            <p className="text-sm text-gray-400 font-mono italic">NestJS + Prisma</p>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-white/10 text-center">
          <span className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-sm font-semibold tracking-wider uppercase shadow-lg shadow-purple-900/40">
            Deployed Today
          </span>
        </div>
      </div>
      <p className="mt-8 text-gray-500 text-sm animate-pulse">
        Press any key to explore (Just kidding, it's a static demo!)
      </p>
    </div>
  );
}
