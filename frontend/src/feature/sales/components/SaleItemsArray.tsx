import { Select, Input, Button } from "@/core/components/ui";
import {
  type Control,
  type UseFormRegister,
  type FieldErrors,
  useFieldArray,
} from "react-hook-form";
import { MdDelete } from "react-icons/md";
import type { BulkSaleFormData } from "../schemas/sale";
import type { Product } from "@/feature/products/schemas/product";

type SaleItemsArrayProps = {
  saleIndex: number;
  control: Control<BulkSaleFormData>;
  register: UseFormRegister<BulkSaleFormData>;
  errors: FieldErrors<BulkSaleFormData>;
  products: Product[];
};

export default function SaleItemsArray({
  saleIndex,
  control,
  register,
  errors,
  products,
}: SaleItemsArrayProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `sales.${saleIndex}.items`,
  });

  return (
    <div className="bg-gray-50 rounded-lg p-3 space-y-3">
      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">
        Productos
      </p>

      {fields.map((item, itemIndex) => (
        <div key={item.id} className="">
          <Select
            {...register(`sales.${saleIndex}.items.${itemIndex}.productId`, {
              valueAsNumber: true,
            })}
            error={
              errors.sales?.[saleIndex]?.items?.[itemIndex]?.productId?.message
            }
            options={[
              { value: "", label: "--- Seleccionar Producto ---", selected: true },
              ...products.map((p) => ({ value: p.id, label: p.name })),
            ]}
          />
          <div className="flex gap-2 items-end">
            <Input
              label="Cant."
              type="number"
              {...register(`sales.${saleIndex}.items.${itemIndex}.quantity`, {
                valueAsNumber: true,
              })}
              error={errors.sales?.[saleIndex]?.items?.[itemIndex]?.quantity}
            />
            <Input
              label="Precio"
              type="number"
              step="0.01"
              {...register(`sales.${saleIndex}.items.${itemIndex}.amount`, {
                valueAsNumber: true,
              })}
              error={errors.sales?.[saleIndex]?.items?.[itemIndex]?.amount}
            />
          </div>
          {fields.length > 1 && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => remove(itemIndex)}
              className="text-gray-400 mb-1 shrink-0"
            >
              <MdDelete size={16} />
            </Button>
          )}
        </div>
      ))}

      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() => append({ productId: 0, quantity: 1, amount: 0 })}
        className="w-full"
      >
        + Producto
      </Button>
    </div>
  );
}
