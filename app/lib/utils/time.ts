/**
 * Parsea un TimeSpan de .NET (formato "d.HH:mm:ss" o "HH:mm:ss") a un objeto legible
 */
export function parseTimeRemaining(timeSpan: string): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
} {
  // TimeSpan puede venir como "d.HH:mm:ss.ffffff" o "HH:mm:ss.ffffff"
  // Primero separamos por ":" para identificar el formato
  const colonParts = timeSpan.split(":");
  
  let days = 0;
  let hours = 0;
  let minutes = 0;
  let seconds = 0;

  if (colonParts.length >= 3) {
    // Formato: "HH:mm:ss" o "d.HH:mm:ss"
    const firstPart = colonParts[0];
    
    // Verificar si el primer segmento contiene días (formato "d.HH")
    if (firstPart.includes(".")) {
      const dayHourParts = firstPart.split(".");
      days = parseInt(dayHourParts[0], 10) || 0;
      hours = parseInt(dayHourParts[1], 10) || 0;
    } else {
      hours = parseInt(firstPart, 10) || 0;
    }
    
    minutes = parseInt(colonParts[1], 10) || 0;
    
    // El último segmento puede tener fracciones de segundo: "ss.ffffff"
    // Solo tomamos la parte entera de los segundos
    const secondsPart = colonParts[2].split(".")[0];
    seconds = parseInt(secondsPart, 10) || 0;
  }

  const totalSeconds = days * 86400 + hours * 3600 + minutes * 60 + seconds;

  return { days, hours, minutes, seconds, totalSeconds };
}

/**
 * Formatea el tiempo restante para mostrar en la UI
 */
export function formatTimeRemaining(timeSpan: string): string {
  const { days, hours, minutes, seconds, totalSeconds } = parseTimeRemaining(timeSpan);

  if (totalSeconds <= 0) {
    return "Finalizada";
  }

  if (days > 0) {
    return `${days}d ${hours}h`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }

  return `${seconds}s`;
}

/**
 * Verifica si la subasta está por terminar (menos de 1 hora)
 */
export function isEndingSoon(timeSpan: string): boolean {
  const { totalSeconds } = parseTimeRemaining(timeSpan);
  return totalSeconds > 0 && totalSeconds < 3600; // Menos de 1 hora
}

/**
 * Verifica si la subasta está en sus últimos minutos (menos de 5 minutos)
 */
export function isEndingVerySoon(timeSpan: string): boolean {
  const { totalSeconds } = parseTimeRemaining(timeSpan);
  return totalSeconds > 0 && totalSeconds < 300; // Menos de 5 minutos
}
