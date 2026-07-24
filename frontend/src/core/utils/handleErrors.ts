import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { ApiValidationError } from "../errors/ApiValidationError";
import { toast } from "react-toastify";
import { ZodError } from "zod";

export const handleApiError = <T extends FieldValues = any>(
  error: unknown,
  setError?: UseFormSetError<T>,
  fallbackMessage: string = "Ha ocurrido un error inesperado"
) => {
  if (error instanceof ApiValidationError) {

    if (setError && error.fields) {
      Object.entries(error.fields).forEach(([field, messages]) => {
        if (messages && messages.length > 0) {
          setError(field as Path<T>, {
            type: "server",
            message: messages[0],
          });
        }
      });
    }

    toast.error(error.message);

  } else if (error instanceof ZodError) {
    console.error("Error de contrato (Zod):", error.message);
    toast.error("Error interno: Los datos recibidos no tienen el formato esperado.");

  } else if (error instanceof Error) {
    toast.error(error.message);
    
  } else if (error instanceof Error) {
    if (error.name !== "AuthError") {
      toast.error(error.message);
    }
  } else {
    toast.error(fallbackMessage);
  }
};