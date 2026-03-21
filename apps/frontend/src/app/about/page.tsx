import React from 'react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-purple-500/30">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/20 blur-[120px] rounded-full" />
      </div>

      <main className="relative z-10 max-w-5xl mx-auto px-6 py-24 md:py-32">
        <header className="mb-20">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-r from-white via-white to-white/40 bg-clip-text text-transparent">
            Empowering the <br />
            <span className="text-purple-400">Future of Freelancing.</span>
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl leading-relaxed">
            Lancerly is more than a platform; it's a movement to redefine how talent connects with opportunity. 
            We're building the infrastructure for the global decentralized workforce.
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="group p-8 rounded-3xl bg-zinc-900/50 border border-zinc-800 hover:border-purple-500/50 transition-all duration-500">
            <h2 className="text-2xl font-semibold mb-4 text-white group-hover:text-purple-400 transition-colors">Our Mission</h2>
            <p className="text-zinc-400 leading-relaxed">
              To provide a seamless, secure, and transparent environment where freelancers can thrive and clients can find the world's best talent without friction.
            </p>
          </div>

          <div className="group p-8 rounded-3xl bg-zinc-900/50 border border-zinc-800 hover:border-blue-500/50 transition-all duration-500">
            <h2 className="text-2xl font-semibold mb-4 text-white group-hover:text-blue-400 transition-colors">Our Vision</h2>
            <p className="text-zinc-400 leading-relaxed">
              A world where geographic boundaries don't limit professional potential, and where excellence is the only currency that matters.
            </p>
          </div>
        </section>

        <footer className="mt-32 pt-12 border-t border-zinc-800">
          <p className="text-zinc-500 text-sm">
            &copy; {new Date().getFullYear()} Lancerly. Created by Adarsha.
          </p>
        </footer>
      </main>
    </div>
  );
}
