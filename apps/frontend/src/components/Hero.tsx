import Button from "./Button";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50 via-white to-indigo-100 py-24 text-center">
      {/* Background blobs */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 opacity-20 blur-3xl animate-pulse"></div>

      <div className="relative z-10 mx-auto max-w-3xl px-6">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl">
          <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
            Find the Right Freelancer
          </span>{" "}
          with AI
        </h1>

        <p className="mt-6 text-lg text-slate-600 leading-relaxed">
          Post your projects, get matched instantly, and collaborate securely —
          all in one platform designed for speed and trust.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button variant="primary" href="/post">
            🚀 Post a Project
          </Button>
          <Button variant="secondary" href="/projects">
            🔍 Find Work
          </Button>
        </div>
      </div>
    </section>
  );
}
