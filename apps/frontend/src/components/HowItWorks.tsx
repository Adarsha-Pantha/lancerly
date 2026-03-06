const steps = [
  { step: "1", text: "Post your project with details." },
  { step: "2", text: "Freelancers send AI-assisted proposals." },
  { step: "3", text: "Collaborate via chat & milestones." },
  { step: "4", text: "Pay securely after approval." },
];

export default function HowItWorks() {
  return (
    <section className="py-16 bg-white">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">How It Works</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto px-6">
        {steps.map((s) => (
          <div key={s.step} className="flex flex-col items-center text-center p-6 border rounded-lg shadow">
            <div className="text-3xl font-bold text-indigo-600">{s.step}</div>
            <p className="mt-4 text-gray-600">{s.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
