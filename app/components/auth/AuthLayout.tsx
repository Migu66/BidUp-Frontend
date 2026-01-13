'use client';

import Link from 'next/link';
import { type ReactNode } from 'react';
import { GavelIcon } from '@/app/components/ui/AuthIcons';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Panel izquierdo - Branding (oculto en móvil) */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-2/5 relative overflow-hidden">
        {/* Fondo con gradiente y patrón */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-dark via-primary to-accent" />
        
        {/* Patrón decorativo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        {/* Círculos decorativos animados */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        
        {/* Contenido */}
        <div className="relative z-10 flex flex-col justify-center items-start p-12 xl:p-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 mb-12 group">
            <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm group-hover:bg-white/30 transition-all duration-300">
              <GavelIcon className="w-8 h-8 text-white" />
            </div>
            <span className="text-3xl font-bold text-white">BidUp</span>
          </Link>

          {/* Texto principal */}
          <h1 className="text-4xl xl:text-5xl font-bold text-white mb-6 leading-tight">
            Descubre subastas <br />
            <span className="text-secondary">únicas en tiempo real</span>
          </h1>
          
          <p className="text-lg text-white/80 mb-10 max-w-md">
            Únete a miles de coleccionistas y encuentra piezas extraordinarias 
            en nuestra plataforma de subastas en vivo.
          </p>

          {/* Features */}
          <div className="space-y-4">
            {[
              { icon: '🔒', text: 'Transacciones 100% seguras' },
              { icon: '⚡', text: 'Subastas en tiempo real' },
              { icon: '🏆', text: 'Artículos exclusivos verificados' },
            ].map((feature, index) => (
              <div 
                key={index}
                className="flex items-center gap-3 text-white/90"
              >
                <span className="text-2xl">{feature.icon}</span>
                <span className="text-lg">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Panel derecho - Formulario */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-12 xl:px-20">
        <div className="w-full max-w-md mx-auto">
          {/* Logo móvil */}
          <Link 
            href="/" 
            className="flex items-center justify-center gap-2 mb-10 lg:hidden"
          >
            <div className="p-2 rounded-lg bg-primary">
              <GavelIcon className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">BidUp</span>
          </Link>

          {/* Encabezado */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2 animate-fade-in">
              {title}
            </h2>
            <p className="text-gray-400 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              {subtitle}
            </p>
          </div>

          {/* Formulario */}
          {children}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            © 2026 BidUp. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
