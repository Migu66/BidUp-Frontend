import { LiveStats } from "./LiveStats";

interface HeroBannerProps {
  activeAuctions: number;
  connectedUsers: number;
}

export function HeroBanner({ activeAuctions, connectedUsers }: HeroBannerProps) {
  return (
    <section className="mb-8 animate-fade-in">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/20 via-gray-900 to-secondary/20 border border-gray-800 p-6 sm:p-8">
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Subastas en Tiempo Real
          </h1>
          <p className="text-gray-400 mb-4 max-w-lg">
            Descubre artículos únicos y puja en vivo. Regístrate para participar en las subastas.
          </p>
          <LiveStats activeAuctions={activeAuctions} connectedUsers={connectedUsers} />
        </div>
        {/* Decoración */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-20 w-32 h-32 bg-secondary/10 rounded-full blur-2xl" />
      </div>
    </section>
  );
}
