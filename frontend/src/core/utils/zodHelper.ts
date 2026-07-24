import { z } from "zod";

/**
 * Intenta parsear la data con el esquema de Zod.
 * Si falla, muestra un log detallado en consola pero devuelve la data "sucia" 
 * para que no se rompa la aplicación mientras desarrollas.
 */
export function safeValidate<T>(schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);

  if (!result.success) {
    // Agrupamos el log en la consola para que sea fácil de leer
    console.groupCollapsed("🚨 Error de validación Zod");
    console.log("Data original que falló:", data);
    console.table(result.error.format());
    console.groupEnd();
    return data as T; 
  }

  return result.data;
}