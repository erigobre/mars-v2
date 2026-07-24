import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdArrowBack } from "react-icons/md";
import { Button, Select } from "@/core/components/ui";
import FileUploadZone from "../components/FileUploadZone";
import UploadStatusMonitor from "../components/UploadStatusMonitor";
import { useUploadSalesFileMutation } from "../services/salesServices";
import { useAuthStore } from "@/core/stores/authStore";
import { useUploadStore } from "@/core/stores/uploadStore";
import PageHeader from "@/core/components/common/PageHeader";
import { useDistributorsQuery } from "@/feature/admin/services/distributorServices";

export default function UploadSalesView() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === "admin";

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [distributorId, setDistributorId] = useState<number | undefined>(
    undefined
  );
  const { activeUpload, setActiveUpload, clearActiveUpload } = useUploadStore();

  const { data: distributorsData } = useDistributorsQuery(
    1,
    100,
    {},
    { enabled: isAdmin }
  );

  const distributors = distributorsData?.items || [];

  const uploadMutation = useUploadSalesFileMutation();

  const handleUpload = async () => {
    if (!selectedFile) return;

    if (isAdmin && !distributorId) {
      alert("Por favor selecciona un distribuidor");
      return;
    }

    try {
      const response = await uploadMutation.mutateAsync({
        file: selectedFile,
        distributorId: isAdmin ? distributorId : undefined,
      });

      setActiveUpload(response.data.job_id, response.data.batch_uuid);
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setDistributorId(undefined);
    clearActiveUpload();
  };

  const handleComplete = () => {
    setTimeout(() => {
      clearActiveUpload();
      navigate("/admin/sales");
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Cargar Archivo de Ventas"
        subtitle="Importa múltiples ventas desde un archivo Excel o CSV"
      >
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <MdArrowBack className="mr-2" />
          Volver
        </Button>
      </PageHeader>

      {/* Upload Status Monitor (shown after upload) */}
      {activeUpload && (
        <div className="space-y-4">
          <UploadStatusMonitor
            jobId={activeUpload.jobId}
            batchUuid={activeUpload.batchUuid}
            onComplete={handleComplete}
          />

          <Button variant="ghost" onClick={handleReset} className="w-full">
            Cargar Otro Archivo
          </Button>
        </div>
      )}

      {/* Upload Form (shown before upload) */}
      {!activeUpload && (
        <div className="bg-white border border-gray-200 rounded-xl p-8 space-y-6">
          {/* Distributor Selector (Admin only) */}
          {isAdmin && (
            <div className="pb-6 border-b border-gray-200">
              <label
                className="text-base font-bold mb-3 block"
              >
                Selecciona el Distribuidor
              </label>
              <Select
                id="distributorId"
                value={distributorId || ""}
                onChange={(e) =>
                  setDistributorId(Number(e.target.value) || undefined)
                }
                className="w-full md:w-96"
              >
                <option value="">-- Selecciona un distribuidor --</option>
                {distributors.map((dist) => (
                  <option key={dist.id} value={dist.id}>
                    {dist.companyName}
                  </option>
                ))}
              </Select>
              <p className="text-sm text-gray-500 mt-2">
                Todas las ventas del archivo se asociarán a este distribuidor
              </p>
            </div>
          )}

          {/* File Upload Zone */}
          <div>
            <h3 className="text-base font-bold text-gray-900 mb-4">
              {selectedFile ? "Archivo Seleccionado" : "Selecciona el Archivo"}
            </h3>
            <FileUploadZone
              onFileSelect={setSelectedFile}
              selectedFile={selectedFile}
              onClear={handleClearFile}
              isLoading={uploadMutation.isPending}
            />
          </div>

          {/* Upload Button */}
          {selectedFile && (
            <div className="pt-4 flex gap-3">
              <Button
                onClick={handleUpload}
                disabled={
                  uploadMutation.isPending || (isAdmin && !distributorId)
                }
                className="flex-1"
              >
                {uploadMutation.isPending
                  ? "Subiendo..."
                  : "Subir y Procesar Archivo"}
              </Button>
              {!uploadMutation.isPending && (
                <Button variant="ghost" onClick={handleClearFile}>
                  Cancelar
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Information Card */}
      {!activeUpload && (
        <div className="bg-linear-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-xl p-6">
          <h4 className="text-lg font-bold text-gray-900 mb-3">
            📋 Requisitos del Archivo
          </h4>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold mt-0.5">•</span>
              <span>
                El archivo debe estar en formato{" "}
                <strong>Excel (.xlsx, .xls)</strong> o <strong>CSV</strong>
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold mt-0.5">•</span>
              <span>
                El tamaño máximo permitido es <strong>10 MB</strong>
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold mt-0.5">•</span>
              <span>
                Descarga la plantilla de ejemplo para conocer el formato
                correcto
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold mt-0.5">•</span>
              <span>
                El procesamiento se realizará en segundo plano y recibirás el
                estatus en tiempo real
              </span>
            </li>
            {isAdmin && (
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold mt-0.5">•</span>
                <span>
                  <strong>Importante:</strong> Debes seleccionar un distribuidor
                  antes de subir el archivo
                </span>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
