/**
 * Formatea una fecha ISO 8601 (ej. "2026-03-15T23:59:59.000000Z") a texto legible.
 * Retorna "—" si el valor es nulo o indefinido.
 */
export function formatDate(
  isoString: string | null | undefined,
  options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }
): string {
  if (!isoString) return "—";
  return new Date(isoString).toLocaleDateString("es-MX", options);
}

/**
 * Formatea una fecha ISO (ej. "2026-03-15T23:59:59.000000Z")
 * al formato "YYYY-MM-DD" requerido por <input type="date" />
 */
export function formatDateForInput(isoDate: string | null | undefined): string {
  if (!isoDate) return "";
  
  const date = new Date(isoDate);
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

export const toDatetimeLocal = (isoDate?: string | null) => {
  if (!isoDate) return "";
  const date = new Date(isoDate);
  // Ajuste de zona horaria local
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
};

/**
 * Formatea una fecha ISO 8601 para incluir también la hora.
 * Ejemplo: "15 mar 2026, 23:59"
 */
export function formatDateTime(
  isoString: string | null | undefined,
  options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false // Cambia a true si prefieres formato 12h (AM/PM)
  }
): string {
  if (!isoString) return "—";
  // Nota: Usamos toLocaleString en lugar de toLocaleDateString
  return new Date(isoString).toLocaleString("es-MX", options);
}

/**
 * Formatea una fecha al estilo largo (ej. "20 de mayo de 2024").
 */
export function formatLongDate(isoString: string | null | undefined): string {
  if (!isoString) return "—";
  
  return new Date(isoString).toLocaleDateString("es-MX", {
    day: "numeric", // 20
    month: "long",  // mayo
    year: "numeric" // 2024
  });
}

/**
 * Retorna los días que faltan desde ahora hasta una fecha ISO.
 * Si la fecha ya pasó, retorna 0.
 */
export function daysUntil(isoString: string | null | undefined): number {
  if (!isoString) return 0;
  const diff = new Date(isoString).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

/**
 * Retorna los días transcurridos desde una fecha ISO hasta hoy.
 */
export function daysSince(isoString: string | null | undefined): number {
  if (!isoString) return 0;
  const diff = Date.now() - new Date(isoString).getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

/**
 * Calcula el porcentaje de avance entre dos fechas.
 * Útil para barras de progreso de periodos/ciclos.
 */
export function periodProgressPercent(
  startDate: string | null | undefined,
  endDate: string | null | undefined
): number {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const now = Date.now();
  if (now <= start) return 0;
  if (now >= end) return 100;
  return Math.round(((now - start) / (end - start)) * 100);
}

/**
 * Formatea una cantidad en pesos mexicanos.
 */
export function formatCurrency(amount: number, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    ...options
  }).format(amount);
}

export function formatNumber(amount: number): string {
  return amount.toLocaleString("en-US");
}

export function formatFloatToInteger(amount: number): string {
  return amount.toFixed(0);
}