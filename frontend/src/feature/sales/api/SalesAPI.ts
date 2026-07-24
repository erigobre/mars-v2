import api from "@/core/api/axios";
import type { ApiResponse, PaginatedData } from "@/core/types";
import {
  saleSchema,
  // salesArraySchema,
  uploadStatusSchema,
  type Sale,
  type SaleFormData,
  type BulkSaleFormData,
  type UploadStatus,
} from "../schemas/sale";
import { safeValidate } from "@/core/utils/zodHelper";
import { cleanObj } from "@/core/utils/cleanObj";

// GET /sales - Lista paginada de ventas
export async function getSales(page: number, perPage: number, search?: string, distributorId?: number) {
  const { data } = await api.get<ApiResponse<PaginatedData<Sale[]>>>("/sales", {
    params: cleanObj({ page, per_page: perPage, search, distributor_id: distributorId }),
  });
  // safeValidate(salesArraySchema, data.data.items);
  return data.data;
}

// GET /sales/{id} - Detalles de una venta
export async function getSaleById(id: number) {
  const { data } = await api.get<ApiResponse<Sale>>(`/sales/${id}`);
  return safeValidate(saleSchema, data.data);
  // return saleSchema.parse(data.data)
}

// POST /sales - Crear venta individual
export async function createSale(formData: SaleFormData) {
  const { data } = await api.post<ApiResponse<Sale>>("/sales", formData);
  return data;
}

// POST /sales/bulk - Crear múltiples ventas
export async function createBulkSales(formData: BulkSaleFormData) {
  const { data } = await api.post<ApiResponse<Sale[]>>("/sales/bulk", formData);
  return data;
}

// POST /sales/upload - Subir archivo de ventas
export async function uploadSalesFile(file: File, distributorId?: number) {
  const fd = new FormData();
  fd.append("file", file);
  if (distributorId) fd.append("distributor_id", String(distributorId));

  const { data } = await api.post<
    ApiResponse<{
      batch_uuid: string;
      job_id: string;
      status_url: string;
    }>
  >("/sales/upload", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

// GET /sales/upload/{jobId}/status - Estado de carga
export async function getUploadStatus(jobId: string) {
  const { data } = await api.get<ApiResponse<UploadStatus>>(
    `/sales/upload/${jobId}/status`
  );
  return safeValidate(uploadStatusSchema, data.data);
}

// GET /sales/template - Descargar plantilla
export async function downloadTemplate() {
  const response = await api.get("/sales/template", {
    responseType: "blob",
  });

  // Crear enlace de descarga
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "ventas_plantilla.xlsx");
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
