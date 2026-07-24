import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { MdArrowBack, MdSave, MdTableChart, MdInfo } from "react-icons/md";
import PageHeader from "@/core/components/common/PageHeader";
import { Button, Input } from "@/core/components/ui";
import { usePageBreadcrumbs } from "@/core/hooks/usePageBreadcrumbs";
import {
  useTierPriceMatrixQuery,
  useUpdateBulkPricesMutation,
} from "../services/tierPriceMatrixServices";
import { useDistributorDetailsQuery } from "@/feature/admin/services/distributorServices";
import TierBadge from "../components/TierBadge";

export default function TierPriceMatrixView() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const distributorId = Number(searchParams.get("distributorId"));
  
  const { data: distributor } = useDistributorDetailsQuery(distributorId);
  const { data: matrixData, isLoading } = useTierPriceMatrixQuery(distributorId);
  const { mutate: updateBulk, isPending } = useUpdateBulkPricesMutation(distributorId);

  const [localMatrix, setLocalMatrix] = useState<Record<number, Record<number, number>>>( {});

  usePageBreadcrumbs([
    { label: "Vendedores", to: "/admin/sellers" },
    { label: "Rangos", to: "/admin/sellers/tiers" },
    { label: "Matriz de Precios" },
  ]);

  useEffect(() => {
    if (matrixData?.matrix) {
      const initial: Record<number, Record<number, number>> = {};
      Object.entries(matrixData.matrix).forEach(([baseCost, tierPrices]) => {
        initial[Number(baseCost)] = {};
        Object.entries(tierPrices).forEach(([tierId, price]) => {
          initial[Number(baseCost)][Number(tierId)] = price ?? 0;
        });
      });
      setLocalMatrix(initial);
    }
  }, [matrixData]);

  if (!distributorId) {
    return (
      <div className="p-8 text-center">
        <MdInfo className="mx-auto text-6xl text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-700">No se ha seleccionado un distribuidor</h2>
        <Button className="mt-4" onClick={() => navigate("/admin/sellers/tiers")}>
          Volver a Rangos
        </Button>
      </div>
    );
  }

  const handlePriceChange = (baseCost: number, tierId: number, value: string) => {
    const numValue = parseInt(value) || 0;
    setLocalMatrix((prev) => ({
      ...prev,
      [baseCost]: {
        ...prev[baseCost],
        [tierId]: numValue,
      },
    }));
  };

  const handleSave = () => {
    const rules = [];
    for (const [baseCost, tiers] of Object.entries(localMatrix)) {
      for (const [tierId, price] of Object.entries(tiers)) {
        rules.push({
          base_cost: Number(baseCost),
          tier_id: Number(tierId),
          price_in_points: price,
        });
      }
    }
    updateBulk(rules);
  };

  return (
    <div>
      <PageHeader
        title={`Matriz de Precios: ${distributor?.companyName || "Cargando..."}`}
        subtitle="Configura precios masivos por categoría de costo y rango de vendedor."
      >
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            leftIcon={<MdArrowBack className="text-xl" />}
            className="shadow-sm rounded-lg border border-slate-200"
            onClick={() => navigate("/admin/sellers/tiers")}
          >
            Volver
          </Button>
          <Button
            variant="primary"
            leftIcon={<MdSave className="text-xl" />}
            className="shadow-sm rounded-lg"
            onClick={handleSave}
            loading={isPending}
            disabled={isLoading}
          >
            Guardar Cambios
          </Button>
        </div>
      </PageHeader>

      {isLoading ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-500">Cargando matriz de precios...</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
            <MdTableChart className="text-primary text-xl" />
            <h3 className="font-bold text-slate-800 text-lg">Configuración Masiva</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  <th className="p-6 font-bold text-slate-600 border-b border-slate-100 w-64">
                    Categoría de Premio
                  </th>
                  {matrixData?.tiers.map((tier) => (
                    <th key={tier.id} className="p-6 font-bold text-slate-600 border-b border-slate-100 min-w-48">
                      <TierBadge 
                        name={tier.name} 
                        color={tier.color} 
                        icon={tier.icon} 
                        size="sm"
                      />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrixData?.categories.map((category) => (
                  <tr key={category.value} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-6 border-b border-slate-100">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800">{category.label}</span>
                        <span className="text-xs text-slate-400">
                          {matrixData.rewardCounts[category.value] || 0} premios en esta categoría
                        </span>
                      </div>
                    </td>
                    {matrixData?.tiers.map((tier) => (
                      <td key={tier.id} className="p-6 border-b border-slate-100">
                        <div className="relative">
                          <Input
                            type="number"
                            min={0}
                            value={localMatrix[category.value]?.[tier.id] ?? ""}
                            onChange={(e) => handlePriceChange(category.value, tier.id, e.target.value)}
                            className="!py-2 !pr-10 font-bold text-primary"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 uppercase">
                            pts
                          </span>
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="p-6 bg-blue-50 border-t border-blue-100">
            <div className="flex gap-3">
              <MdInfo className="text-blue-500 text-2xl shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-bold mb-1">¿Cómo funciona esto?</p>
                <p>
                  Al cambiar un valor en esta matriz y guardar, <strong>todos los premios</strong> que pertenecen a esa categoría de costo 
                  se actualizarán automáticamente para ese rango. Los premios que no tengan una categoría de costo asignada no se verán afectados.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
