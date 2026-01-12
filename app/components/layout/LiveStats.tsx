interface LiveStatsProps {
  activeAuctions: number;
  connectedUsers: number;
}

export function LiveStats({ activeAuctions, connectedUsers }: LiveStatsProps) {
  return (
    <div className="flex items-center gap-6 text-sm">
      <div className="flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
        </span>
        <span className="text-gray-400">
          <span className="text-white font-semibold">{activeAuctions}</span> subastas activas
        </span>
      </div>
      <div className="hidden sm:block h-4 w-px bg-gray-700" />
      <div className="hidden sm:flex items-center gap-2 text-gray-400">
        <span className="text-white font-semibold">{connectedUsers.toLocaleString("es-ES")}</span> usuarios conectados
      </div>
    </div>
  );
}
