"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { SearchIcon } from "@/app/components/ui";
import { useAuth } from "@/app/context";

interface HeaderProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export function Header({ searchQuery = "", onSearchChange }: HeaderProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  
  const isPrincipalPage = pathname === "/";

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

          {/* Search bar */}
          {isPrincipalPage && (
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <SearchIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                placeholder="Buscar subastas..."
                value={searchQuery}
                onChange={(e) => onSearchChange?.(e.target.value)}
                className="w-full h-10 pl-10 pr-4 bg-gray-900/50 border border-gray-800 focus:border-primary/50 rounded-xl text-white placeholder:text-gray-500 outline-none transition-colors"
                aria-label="Buscar subastas"
              />
            </div>
          </div>
        )}

          {/* Auth section */}
          <div className="flex items-center gap-2 shrink-0">
            {isAuthenticated ? (
              <>
                <Link
                  href="/auctions/create"
                  className="px-4 py-2 text-sm font-medium bg-primary hover:bg-primary-dark text-white rounded-xl transition-colors shadow-lg shadow-primary/25 flex items-center gap-2"
                  aria-label="Crear subasta"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="hidden sm:inline">Crear Subasta</span>
                </Link>
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
                      className="w-full px-4 py-2.5 text-left text-sm text-red-500 hover:bg-gray-800 hover:text-red-400 transition-colors border-t border-gray-800"
                    >
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
              </>
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
