import Link from "next/link";
import { GavelIcon } from "@/app/components/ui";

export function RegisterCTA() {
  return (
    <section className="mt-12 animate-fade-in">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-gray-900 via-primary/10 to-gray-900 border border-primary/30 p-6 text-center">
        <div className="relative z-10">
          <GavelIcon className="w-10 h-10 mx-auto mb-3 text-primary" />
          <h2 className="text-xl font-bold text-white mb-2">
            ¿Quieres participar en las subastas?
          </h2>
          <p className="text-gray-400 mb-4 max-w-md mx-auto">
            Crea una cuenta gratuita para poder realizar pujas y ganar artículos únicos
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40"
          >
            Crear cuenta gratis
          </Link>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer" />
      </div>
    </section>
  );
}
