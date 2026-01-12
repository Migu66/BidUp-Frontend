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
  const cleanTimeSpan = timeSpan.split(".").slice(0, 2).join("."); // Remover fracciones de segundo
  
  let days = 0;
  let timePart = cleanTimeSpan;

  // Verificar si tiene días (formato: "d.HH:mm:ss")
  if (cleanTimeSpan.includes(".")) {
    const parts = cleanTimeSpan.split(".");
    days = parseInt(parts[0], 10);
    timePart = parts[1];
  }

  const timeParts = timePart.split(":");
  const hours = parseInt(timeParts[0] || "0", 10);
  const minutes = parseInt(timeParts[1] || "0", 10);
  const seconds = parseInt(timeParts[2] || "0", 10);

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
