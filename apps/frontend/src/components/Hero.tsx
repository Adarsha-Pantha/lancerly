import Button from "./Button";

export default function Hero() {
  return (
    <section className="bg-gray-50 text-center py-20">
      <h1 className="text-5xl font-bold text-indigo-600">
        Find the Right Freelancer with AI
      </h1>
      <p className="mt-4 text-lg text-gray-600">
        Post projects, get matched instantly, and pay securely.
      </p>
      <div className="mt-6 space-x-4">
        <Button variant="primary" href="/post">Post a Project</Button>
        <Button variant="secondary" href="/projects">Find Work</Button>
      </div>
    </section>
  );
}
