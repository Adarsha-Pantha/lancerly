const categories = [
  { name: "Design", icon: "🎨" },
  { name: "Writing", icon: "✍️" },
  { name: "Tech", icon: "💻" },
  { name: "Marketing", icon: "📈" },
];

export default function Categories() {
  return (
    <section className="py-16 bg-white">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">Browse by Category</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto px-6">
        {categories.map((cat) => (
          <div key={cat.name} className="flex flex-col items-center p-6 border rounded-lg shadow hover:shadow-lg">
            <span className="text-5xl">{cat.icon}</span>
            <h3 className="mt-4 text-lg font-semibold">{cat.name}</h3>
          </div>
        ))}
      </div>
    </section>
  );
}
