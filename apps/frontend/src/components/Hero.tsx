import Button from "./Button";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-cream via-cream-light to-cream py-24 text-center">
      {/* Background blobs */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-r from-brand-purple via-brand-purple-light to-brand-purple opacity-20 blur-3xl animate-pulse"></div>

      <div className="relative z-10 mx-auto max-w-3xl px-6">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl">
          <span className="gradient-text">
            Find the Right Freelancer
          </span>{" "}
          with AI
        </h1>

        <p className="mt-6 text-lg text-brand-purple-dark/80 leading-relaxed">
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
