import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MdAdd, MdStore, MdRefresh } from "react-icons/md";
import { Drawer, Button, Select } from "@/core/components/ui";
import { bulkSaleFormSchema, type BulkSaleFormData } from "../schemas/sale";
import { useCreateBulkSalesMutation } from "../services/salesServices";
import { useAuthStore } from "@/core/stores/authStore";
import { useDistributorsQuery } from "@/feature/admin/services/distributorServices";
import { useSellersQuery } from "@/feature/management/sellers/services/sellerServices";
import { useUnifiedProductsQuery } from "@/feature/products/services/productServices";
import SaleFormItem from "./SaleFormItem";
import { useSearchParams } from "react-router-dom";

type BulkSaleFormDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function BulkSaleFormDrawer({
  isOpen,
  onClose,
}: BulkSaleFormDrawerProps) {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "admin";
  const [searchParams] = useSearchParams();

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    setError,
    reset,
  } = useForm<BulkSaleFormData>({
    resolver: zodResolver(bulkSaleFormSchema),
    defaultValues: {
      sales: [
        {
          sellerId: 0,
          saleDate: new Date().toISOString().split("T")[0],
          notes: "",
          items: [{ productId: 0, quantity: 1, amount: 0 }],
        },
      ],
    },
  });

  const selectedDistributorId = watch("distributorId");
  const { data: productsData } = useUnifiedProductsQuery(1, 100, { active_only: true });
  const products = (productsData?.items || []).filter(p => p.isActive);

  const { data: distributorsData } = useDistributorsQuery(
    1,
    100,
    {},
    { enabled: isAdmin && isOpen }
  );

  const distributorIdToFilter = isAdmin ? selectedDistributorId : user?.id;

  const { data: sellersData, isLoading: isLoadingSellers } = useSellersQuery(
    1,
    100,
    { distributorId: distributorIdToFilter },
    { enabled: !!distributorIdToFilter && isOpen }
  );

  const distributors = distributorsData?.items || [];
  const sellers = sellersData?.items || [];

  useEffect(() => {
    // Solo si el drawer está abierto
    if (!isOpen) return;

    const urlDistributorId = searchParams.get("distributorId");
    const urlSellerId = searchParams.get("sellerId");

    if (isAdmin && urlDistributorId) {
      setValue("distributorId", Number(urlDistributorId));
    } else if (!isAdmin && user?.id) {
      setValue("distributorId", user.id);
    }

    if (urlSellerId) {
      setValue("sales.0.sellerId", Number(urlSellerId));
    }
  }, [isOpen, searchParams, isAdmin, user, setValue]);

  useEffect(() => {
    if (!isAdmin && user?.id) setValue("distributorId", user.id);
  }, [isAdmin, user, setValue]);

  const {
    fields: salesFields,
    append: appendSale,
    remove: removeSale,
  } = useFieldArray({
    control,
    name: "sales",
  });

  const createMutation = useCreateBulkSalesMutation({
    setError,
    onClose: () => {
      reset();
      onClose();
    },
  });

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Registro Masivo de Ventas">
      <form
        onSubmit={handleSubmit((data) => createMutation.mutate(data))}
        className="flex flex-col h-full"
      >
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30">
          <section className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <MdStore className="text-base" /> Configuración General
            </h4>
            {isAdmin ? (
              <Select
                label="Distribuidor Destino *"
                {...register("distributorId", { valueAsNumber: true })}
                error={errors.distributorId?.message}
                options={[
                  { value: "", label: "Selecciona un distribuidor..." },
                  ...distributors.map((d) => ({
                    value: d.id,
                    label: d.companyName || d.username,
                  })),
                ]}
              />
            ) : (
              <div className="text-sm text-primary font-medium p-2 bg-primary/5 rounded-lg border border-primary/10">
                Distribuidor:{" "}
                <span className="font-bold">{user?.username}</span>
              </div>
            )}
          </section>

          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Ventas en lote
              </h4>
              {isLoadingSellers && (
                <span className="text-[10px] text-primary animate-pulse flex items-center gap-1">
                  <MdRefresh className="animate-spin" /> Cargando vendedores
                </span>
              )}
            </div>

            {salesFields.map((field, index) => (
              <SaleFormItem
                key={field.id}
                index={index}
                register={register}
                control={control}
                errors={errors}
                onRemove={() => removeSale(index)}
                sellers={sellers}
                products={products}
                isAdmin={isAdmin}
                selectedDistributorId={selectedDistributorId}
              />
            ))}
          </div>

          <Button
            type="button"
            variant="ghost"
            onClick={() =>
              appendSale({
                sellerId: 0,
                saleDate: new Date().toISOString().split("T")[0],
                notes: "",
                items: [{ productId: 0, quantity: 1, amount: 0 }],
              })
            }
            className="w-full border-2 border-dashed border-gray-300 py-6 hover:border-primary hover:bg-primary/5 rounded-xl transition-all"
          >
            <MdAdd className="text-xl mr-2" /> Añadir otra venta
          </Button>
        </div>

        <div className="p-4 bg-white flex gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={createMutation.isPending}
            className="flex-1 shadow-md"
          >
            {createMutation.isPending ? "Procesando..." : "Guardar Todo"}
          </Button>
        </div>
      </form>
    </Drawer>
  );
}
