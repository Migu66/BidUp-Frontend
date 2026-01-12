import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-gray-800/50 bg-gray-950/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
              <span className="text-white font-bold">B</span>
            </div>
            <span className="text-lg font-bold text-white">BidUp</span>
          </div>
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} BidUp. Subastas en tiempo real.
          </p>
          <nav className="flex items-center gap-4 text-sm text-gray-500">
            <Link href="#" className="hover:text-white transition-colors">
              Términos
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              Privacidad
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              Ayuda
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
