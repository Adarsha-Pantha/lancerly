export default function Footer() {
  return (
    <footer className="bg-brand-purple-dark text-cream/80 py-8 mt-16">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between">
        <p>&copy; {new Date().getFullYear()} Lancerly. All rights reserved.</p>
        <ul className="flex space-x-6">
          <li><a href="/about" className="hover:text-cream-light">About</a></li>
          <li><a href="/terms" className="hover:text-cream-light">Terms</a></li>
          <li><a href="/contact" className="hover:text-cream-light">Contact</a></li>
        </ul>
      </div>
    </footer>
  );
}
