const projects = [
  { title: "Logo Design for Startup", budget: "$200", match: "92%" },
  { title: "React Website Development", budget: "$1500", match: "88%" },
  { title: "SEO Content Writing", budget: "$100", match: "95%" },
];

export default function ProjectGrid() {
  return (
    <section className="py-16 bg-gray-50">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">Latest Projects</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-6">
        {projects.map((p) => (
          <div key={p.title} className="p-6 bg-white rounded-lg shadow hover:shadow-lg">
            <h3 className="text-xl font-semibold">{p.title}</h3>
            <p className="mt-2 text-gray-600">Budget: {p.budget}</p>
            <span className="inline-block mt-4 text-sm bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full">
              AI Match {p.match}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
