import { useNavigate } from "react-router-dom";
import { MdPeople, MdArrowForward } from "react-icons/md";
import PageHeader from "@/core/components/common/PageHeader";
import { Button } from "@/core/components/ui";
import SellersTable from "@/feature/management/sellers/components/SellersTable";
import { useSellersQuery } from "@/feature/management/sellers/services/sellerServices";
import type { Seller } from "@/feature/management/sellers/schemas/seller";

export default function AdminDashboardView() {
  const navigate = useNavigate();

  const { data, isLoading, isPlaceholderData } = useSellersQuery(1, 5, {});

  const handleView = (seller: Seller) => {
    navigate(`/admin/sellers/${seller.id}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Panel de Administración"
        subtitle="Resumen general del sistema y accesos rápidos."
      />

      <div className="bg-white border border-gray-200 shadow-sm rounded-2xl overflow-hidden">
        <div className="bg-slate-50 px-6 py-5 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <MdPeople className="text-2xl" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                Últimos Vendedores Registrados
              </h3>
              <p className="text-sm text-slate-500 font-medium mt-0.5">
                Nuevos ingresos a nivel global
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={() => navigate("/admin/sellers")}
            className="bg-white hover:bg-slate-50 border border-slate-200 shadow-sm w-full sm:w-auto"
          >
            Ver todos
            <MdArrowForward className="ml-2 text-lg text-slate-400" />
          </Button>
        </div>

        <div className="p-5">
          <SellersTable
            data={data?.items ?? []}
            isLoading={isLoading}
            isPlaceholderData={isPlaceholderData}
            onPageChange={() => {}}
            onPerPageChange={() => {}}
            onEdit={() => navigate("/sellers")}
            onView={handleView}
          />
        </div>
      </div>
    </div>
  );
}
