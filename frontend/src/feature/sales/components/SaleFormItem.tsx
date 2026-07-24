import { Button, Input, Select } from "@/core/components/ui";
import SaleItemsArray from "./SaleItemsArray";
import { useEffect, useState } from "react";
import { type UseFormRegister, type Control, type FieldErrors, useWatch } from "react-hook-form";
import { MdDelete, MdExpandMore } from "react-icons/md";
import type { BulkSaleFormData } from "../schemas/sale";
import type { Seller } from "@/feature/management/sellers/schemas/seller";
import type { Product } from "@/feature/products/schemas/product";

type SaleFormItemProps = {
  index: number;
  register: UseFormRegister<BulkSaleFormData>;
  control: Control<BulkSaleFormData>;
  errors: FieldErrors<BulkSaleFormData>;
  onRemove: () => void;
  sellers: Seller[];
  products: Product[];
  isAdmin: boolean;
  selectedDistributorId?: number;
};

export default function SaleFormItem({
  index,
  register,
  control,
  errors,
  onRemove,
  sellers,
  products,
  isAdmin,
  selectedDistributorId,
}: SaleFormItemProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasError = !!errors.sales?.[index];

  const currentSellerId = useWatch({
    control,
    name: `sales.${index}.sellerId`,
  });

  useEffect(() => {
    if (hasError) {
      setIsExpanded(true);
    }
  }, [hasError]);

  return (
    <div
      className={`bg-white border ${
        hasError ? "border-red-200" : "border-gray-200"
      } rounded-xl shadow-sm transition-all duration-300`}
    >
      <div
        className="flex items-center justify-between p-3 cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <span
            className={`w-6 h-6 rounded-full ${
              hasError ? "bg-red-500" : "bg-primary"
            } text-white flex items-center justify-center text-[10px] font-bold`}
          >
            {index + 1}
          </span>
          <h3 className="text-sm font-bold text-gray-700">
            Venta #{index + 1}
          </h3>
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="text-red-400 hover:text-red-600"
          >
            <MdDelete size={18} />
          </Button>
          <div
            className={`transition-transform duration-300 ${
              isExpanded ? "rotate-180" : ""
            }`}
          >
            <MdExpandMore size={24} className="text-gray-400" />
          </div>
        </div>
      </div>

      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isExpanded
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0 pointer-events-none"
        }`}
      >
        <div className="overflow-hidden">
          <div className="p-4 pt-0 space-y-4 border-t border-gray-50">
            <div className="space-y-4">
              <Select
                label="Vendedor Responsable *"
                {...register(`sales.${index}.sellerId`, {
                  valueAsNumber: true,
                })}
                value={currentSellerId || ""}
                error={errors.sales?.[index]?.sellerId?.message}
                disabled={isAdmin && !selectedDistributorId}
                options={[
                  { value: "", label: "Seleccionar vendedor..." },
                  ...sellers.map((s) => ({ value: s.id, label: s.username })),
                ]}
              />
              <Input
                label="Fecha de Operación *"
                type="date"
                {...register(`sales.${index}.saleDate`)}
                error={errors.sales?.[index]?.saleDate}
              />
              <Input
                label="Notas"
                placeholder="Opcional..."
                {...register(`sales.${index}.notes`)}
                error={errors.sales?.[index]?.notes}
              />
            </div>

            <SaleItemsArray
              saleIndex={index}
              control={control}
              register={register}
              errors={errors}
              products={products}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
