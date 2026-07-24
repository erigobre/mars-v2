import { useState } from "react";
import {
  MdCheckCircle,
  MdError,
  MdHourglassEmpty,
  MdRefresh,
  MdCancel,
} from "react-icons/md";
import { Button } from "@/core/components/ui";
import { useUploadStatusQuery } from "../services/salesServices";
import type { UploadStatus } from "../schemas/sale";

type UploadStatusMonitorProps = {
  jobId: string;
  batchUuid?: string;
  onComplete?: () => void;
};

export default function UploadStatusMonitor({
  jobId,
  batchUuid,
  onComplete,
}: UploadStatusMonitorProps) {
  const [autoRefetch, setAutoRefetch] = useState(true);

  const {
    data: status,
    isLoading,
    refetch,
  } = useUploadStatusQuery(jobId, autoRefetch);

  // Detener auto-refetch cuando el proceso termine
  if (status && status.status !== "processing" && autoRefetch) {
    setAutoRefetch(false);
    if (status.status === "completed" && onComplete) {
      onComplete();
    }
  }

  const getStatusConfig = (uploadStatus?: UploadStatus) => {
    if (!uploadStatus) {
      return {
        icon: MdHourglassEmpty,
        text: "Consultando...",
        color: "gray",
        bgColor: "bg-gray-100",
        textColor: "text-gray-700",
        iconColor: "text-gray-500",
      };
    }

    switch (uploadStatus.status) {
      case "processing":
        return {
          icon: MdHourglassEmpty,
          text: "Procesando archivo",
          color: "blue",
          bgColor: "bg-blue-100",
          textColor: "text-blue-700",
          iconColor: "text-blue-500",
        };
      case "completed":
        return {
          icon: MdCheckCircle,
          text: "Procesamiento completado",
          color: "green",
          bgColor: "bg-green-100",
          textColor: "text-green-700",
          iconColor: "text-green-500",
        };
      case "failed":
        return {
          icon: MdError,
          text: "Error en el procesamiento",
          color: "red",
          bgColor: "bg-red-100",
          textColor: "text-red-700",
          iconColor: "text-red-500",
        };
      case "cancelled":
        return {
          icon: MdCancel,
          text: "Procesamiento cancelado",
          color: "gray",
          bgColor: "bg-gray-100",
          textColor: "text-gray-700",
          iconColor: "text-gray-500",
        };
      default:
        return {
          icon: MdHourglassEmpty,
          text: "Estado desconocido",
          color: "gray",
          bgColor: "bg-gray-100",
          textColor: "text-gray-700",
          iconColor: "text-gray-500",
        };
    }
  };

  const config = getStatusConfig(status);
  const StatusIcon = config.icon;

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className={`${config.bgColor} px-6 py-4 border-b border-gray-200`}>
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-lg bg-white/50 flex items-center justify-center`}
          >
            <StatusIcon className={`${config.iconColor} text-xl`} />
          </div>
          <div className="flex-1">
            <h3 className={`text-sm font-bold ${config.textColor}`}>
              {config.text}
            </h3>
            <p className="text-xs text-gray-600 font-mono">Job ID: {jobId}</p>
          </div>
          {!autoRefetch && status?.status === "processing" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setAutoRefetch(true);
                refetch();
              }}
              className="shrink-0"
            >
              <MdRefresh className="mr-2" />
              Auto-actualizar
            </Button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {status?.status === "processing" && (
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
            <span>Progreso</span>
            <span className="font-bold">{status.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-primary h-full transition-all duration-300 rounded-full"
              style={{ width: `${status.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-6 space-y-4">
        {status?.status === "completed" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-sm text-gray-600">Ventas creadas</span>
              <span className="text-lg font-bold text-green-600">
                {status.salesCreated?.toLocaleString() || 0}
              </span>
            </div>
            {batchUuid && (
              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-gray-600">Lote UUID</span>
                <span className="text-xs font-mono text-gray-800 bg-gray-100 px-2 py-1 rounded">
                  {batchUuid}
                </span>
              </div>
            )}
          </div>
        )}

        {(status?.status === "failed" || status?.status === "cancelled") && status.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="text-sm font-bold text-red-900 mb-2">Error{Array.isArray(status.error) && status.error.length > 1 ? 'es' : ''}</h4>
            {Array.isArray(status.error) ? (
              <ul className="list-disc list-inside text-sm text-red-700 space-y-1 max-h-64 overflow-y-auto">
                {status.error.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-red-700">{status.error}</p>
            )}
          </div>
        )}

        {status?.status === "processing" && (
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <p className="text-sm text-blue-700">
              El archivo se está procesando. Este proceso puede tardar unos
              minutos dependiendo del tamaño del archivo. Puedes cerrar esta
              página y volver más tarde.
            </p>
          </div>
        )}

        {/* Manual refresh button */}
        {!autoRefetch && (
          <Button
            variant="ghost"
            onClick={() => refetch()}
            disabled={isLoading}
            className="w-full"
          >
            <MdRefresh className={`mr-2 ${isLoading ? "animate-spin" : ""}`} />
            {isLoading ? "Consultando..." : "Verificar Estado"}
          </Button>
        )}
      </div>

      {/* Auto-refetch indicator */}
      {autoRefetch && status?.status === "processing" && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-gray-600">
              Actualizando automáticamente cada 3 segundos
            </span>
          </div>
          <button
            onClick={() => setAutoRefetch(false)}
            className="text-xs text-gray-500 hover:text-gray-700 underline"
          >
            Detener
          </button>
        </div>
      )}
    </div>
  );
}
