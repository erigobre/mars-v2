import { useState, useCallback } from "react";
import {
  MdCloudUpload,
  MdInsertDriveFile,
  MdDownload,
  MdClose,
} from "react-icons/md";
import { Button } from "@/core/components/ui";
import { useDownloadTemplateMutation } from "../services/salesServices"

type FileUploadZoneProps = {
  onFileSelect: (file: File) => void;
  selectedFile?: File | null;
  onClear?: () => void;
  isLoading?: boolean;
};

export default function FileUploadZone({
  onFileSelect,
  selectedFile,
  onClear,
  isLoading = false,
}: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const {
    mutate: dowloadTemplate,
    isPending: isLoadingDownloadTemplate,
  } = useDownloadTemplateMutation();

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      const file = files[0];

      if (file && validateFile(file)) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && validateFile(file)) {
        onFileSelect(file);
      }
      e.target.value = "";
    },
    [onFileSelect]
  );
  const handleDownloadTemplate = () => {
    dowloadTemplate()
  };

  const validateFile = (file: File): boolean => {
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
    ];
    const maxSize = 10 * 1024 * 1024;

    if (
      !validTypes.includes(file.type) &&
      !file.name.match(/\.(xlsx|xls|csv)$/i)
    ) {
      alert("Por favor selecciona un archivo Excel (.xlsx, .xls) o CSV");
      return false;
    }

    if (file.size > maxSize) {
      alert("El archivo no debe superar los 10 MB");
      return false;
    }

    return true;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  if (selectedFile) {
    return (
      <div className="bg-white border-2 border-primary rounded-xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <MdInsertDriveFile className="text-primary text-2xl" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 truncate">
              {selectedFile.name}
            </p>
            <p className="text-sm text-gray-500">
              {formatFileSize(selectedFile.size)}
            </p>
          </div>
          {!isLoading && onClear && (
            <Button
              variant="ghost"
              onClick={onClear}
              className="shrink-0 text-red-600 hover:bg-red-50"
            >
              <MdClose className="mr-2" />
              Cambiar
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-xl p-8 transition-all duration-200
          ${
            isDragging
              ? "border-primary bg-primary/5 scale-[1.02]"
              : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
          }
        `}
      >
        <input
          type="file"
          onChange={handleFileInput}
          accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isLoading}
        />

        <div className="flex flex-col items-center text-center">
          <div
            className={`
            w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors
            ${
              isDragging ? "bg-primary text-white" : "bg-gray-100 text-gray-400"
            }
          `}
          >
            <MdCloudUpload className="text-3xl" />
          </div>

          <h3 className="text-lg font-bold text-gray-900 mb-1">
            {isDragging ? "Suelta el archivo aquí" : "Arrastra tu archivo aquí"}
          </h3>

          <p className="text-sm text-gray-500 mb-4">
            o{" "}
            <span className="text-primary font-semibold underline cursor-pointer">
              selecciona desde tu computadora
            </span>
          </p>

          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>Formatos: XLSX, XLS, CSV</span>
            <span>•</span>
            <span>Máximo 10 MB</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center">
        <Button type="button" variant="ghost" onClick={handleDownloadTemplate} disabled={isLoadingDownloadTemplate} className="text-sm">
          <MdDownload className="mr-2" />
          Descargar Plantilla de Ejemplo
        </Button>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
        <h4 className="text-sm font-bold text-blue-900 mb-2">
          💡 Instrucciones
        </h4>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>
            • Descarga la plantilla y complétala con los datos de las ventas
          </li>
          <li>• Asegúrate de incluir todos los campos requeridos</li>
          <li>• Cada fila representa una venta con sus productos</li>
          <li>• El archivo se procesará automáticamente al subirlo</li>
        </ul>
      </div>
    </div>
  );
}
