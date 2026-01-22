"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context";

/**
 * Header simplificado sin barra de búsqueda para páginas de detalle
 */
export function SimpleHeader() {
  const { user, isAuthenticated, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    router.push("/");
  };

  const getInitial = () => {
    if (user?.userName) {
      return user.userName.charAt(0).toUpperCase();
    }
    return "U";
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-gray-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-lg shadow-primary/25">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <span className="text-xl font-bold text-white hidden sm:block">BidUp</span>
          </Link>

          {/* Auth section */}
          <div className="flex items-center gap-2 shrink-0">
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow"
                  aria-label="Menú de usuario"
                  aria-expanded={isDropdownOpen}
                >
                  {getInitial()}
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-800 rounded-xl shadow-xl overflow-hidden animate-scale-in">
                    <div className="px-4 py-3 border-b border-gray-800">
                      <p className="text-sm font-medium text-white">{user?.userName}</p>
                      <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                    </div>
                    <Link
                      href="/dashboard"
                      onClick={() => setIsDropdownOpen(false)}
                      className="block w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                    >
                      Mi Dashboard
                    </Link>
                    <Link
                      href="/profile"
                      onClick={() => setIsDropdownOpen(false)}
                      className="block w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                    >
                      Mi Perfil
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors border-t border-gray-800"
                    >
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                  Entrar
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-medium bg-primary hover:bg-primary-dark text-white rounded-xl transition-colors shadow-lg shadow-primary/25"
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
