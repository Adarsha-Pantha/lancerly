export default function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-200 py-8 mt-16">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between">
        <p>&copy; {new Date().getFullYear()} Lancerly. All rights reserved.</p>
        <ul className="flex space-x-6">
          <li><a href="/about" className="hover:text-white">About</a></li>
          <li><a href="/terms" className="hover:text-white">Terms</a></li>
          <li><a href="/contact" className="hover:text-white">Contact</a></li>
        </ul>
      </div>
    </footer>
  );
}
