import { useState, useRef, useEffect } from "react";
import { MdCloudUpload, MdClose } from "react-icons/md";

// 1. Definimos las Props que lo hacen reutilizable
export interface ImageDropzoneProps {
  label?: string;
  initialImage?: string;
  onFileChange: (file: File | null) => void;
  error?: string;
  variant?: "circle" | "rectangle";
}

export function ImageDropzone({
  label,
  initialImage,
  onFileChange,
  error,
  variant = "rectangle",
}: ImageDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(initialImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreview(initialImage || null);
  }, [initialImage]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const processFile = (file?: File) => {
    if (file && file.type.startsWith("image/")) {
      setPreview(URL.createObjectURL(file));
      onFileChange(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFile(e.dataTransfer.files[0]);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFile(e.target.files?.[0]);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    onFileChange(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const previewClasses =
    variant === "circle"
      ? "w-32 h-32 rounded-full object-cover border-4 border-white shadow-md mx-auto"
      : "w-full h-44 object-cover rounded-xl";

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-sm font-semibold text-gray-800">{label}</label>
      )}

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? "border-primary bg-blue-50"
            : error
            ? "border-red-400 bg-red-50 hover:bg-red-100/50"
            : "border-gray-300 hover:border-primary/50 hover:bg-gray-50"
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleChange}
          accept="image/*"
          className="hidden"
        />

        {preview ? (
          <div
            className={`relative ${
              variant === "circle" ? "w-full text-center" : "w-full"
            }`}
          >
            <img src={preview} alt="Vista previa" className={previewClasses} />
            {/* Botón de limpiar */}
            <button
              type="button"
              onClick={handleClear}
              className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1.5 hover:bg-black/70 transition-colors z-10"
              title="Quitar imagen"
            >
              <MdClose className="text-sm" />
            </button>
            <div
              className={`mt-3 ${
                variant === "circle"
                  ? ""
                  : "absolute bottom-0 inset-x-0 bg-black/40 py-2 rounded-b-xl"
              }`}
            >
              <span
                className={`${
                  variant === "circle" ? "text-primary font-bold" : "text-white"
                } text-xs`}
              >
                Haz clic para cambiar
              </span>
            </div>
          </div>
        ) : (
          <div className="py-4">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <MdCloudUpload
                className={`text-3xl ${
                  error ? "text-red-400" : "text-primary"
                }`}
              />
            </div>
            <p className="text-sm font-bold text-gray-700">
              Haz clic o arrastra tu imagen aquí
            </p>
            <p className="text-xs text-gray-400 mt-1">
              PNG, JPG o WEBP (Máx. 5MB)
            </p>
          </div>
        )}
      </div>

      {/* Mensaje de error de validación */}
      {error && (
        <span className="text-xs text-red-500 font-medium">{error}</span>
      )}
    </div>
  );
}
