import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MdEdit, MdImage } from "react-icons/md";
import { Drawer } from "@/core/components/ui/Drawer";
import { Button, Input, Select, Textarea } from "@/core/components/ui";
import {
  productCustomizationSchema,
  type ProductCustomizationFormData,
} from "../schemas/productCustomization";
import type { Product } from "../schemas/product";
import {
  useCustomizeProductMutation,
  useDistributorProductsQuery,
  useUpdateCustomizedProductMutation,
} from "../services/distributorProductServices";
import { LuDollarSign } from "react-icons/lu";

type ProductCustomizationDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  productToCustomize?: Product | null;
};

export default function ProductCustomizationDrawer({
  isOpen,
  onClose,
  productToCustomize,
}: ProductCustomizationDrawerProps) {
  const [showProduct, setShowProduct] = useState<Product | null>(null);

  const { data: catalogData, isLoading: isLoadingCatalog } =
    useDistributorProductsQuery(
      1,
      1000,
      {},
      { enabled: isOpen && !productToCustomize }
    );

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<ProductCustomizationFormData>({
    resolver: zodResolver(productCustomizationSchema),
    mode: "onChange",
    defaultValues: {
      productId: 0,
      customPrice: undefined,
      customSku: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (productToCustomize && isOpen) {
      setShowProduct(productToCustomize);
      reset({
        productId: productToCustomize.id,
        customPrice:
          productToCustomize.customization?.customPrice ??
          productToCustomize.defaultPrice ??
          0,
        customSku:
          productToCustomize.customization?.customSku ??
          productToCustomize.sku ??
          "",
        notes: productToCustomize.customization?.notes ?? "",
      });
    } else if (!isOpen) {
      setShowProduct(null);
      reset();
    }
  }, [productToCustomize, isOpen, reset]);

  const createMutation = useCustomizeProductMutation(onClose);
  const updateMutation = useUpdateCustomizedProductMutation(onClose);

  const isCustomized = productToCustomize?.isCustomized ?? false;
  const productId = watch("productId");

  useEffect(() => {
    if (!productToCustomize && productId && !isLoadingCatalog) {
      const selectedProduct = catalogData?.items.find(
        (prod) => prod.id === productId
      );
      if (selectedProduct) {
        setShowProduct(selectedProduct);
      } else {
        setShowProduct(null);
      }
    }
  }, [productId, catalogData, isLoadingCatalog, productToCustomize]);

  const onSubmit = (data: ProductCustomizationFormData) => {
    if (isCustomized && productToCustomize) {
      updateMutation.mutate({
        id: productToCustomize.customization?.id!,
        data,
      });
    } else {
      createMutation.mutate(data);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  const FooterActions = (
    <div className="flex flex-col gap-3 w-full">
      <Button
        variant="primary"
        size="lg"
        fullWidth
        loading={isPending}
        onClick={handleSubmit(onSubmit)}
        className="shadow-lg shadow-primary/20 bg-gray-900 hover:bg-black text-white"
      >
        Guardar Cambios
      </Button>
      <Button
        variant="ghost"
        fullWidth
        onClick={onClose}
        className="text-gray-500 border border-gray-200 hover:bg-gray-50"
      >
        Cancelar
      </Button>
    </div>
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Personalizar Producto"
      icon={<MdEdit />}
      footer={FooterActions}
      isDirty={isDirty}
    >
      <form className="space-y-6">
        {!productToCustomize && (
          <div className="space-y-2">
            <Select
              label="Selecciona un producto del maestro"
              error={errors.productId?.message}
              {...register("productId", { valueAsNumber: true })}
            >
              <option value={0}>Escribe o selecciona un producto...</option>
              {catalogData?.items.map((prod) => (
                <option key={prod.id} value={prod.id}>
                  [{prod.sku}] - {prod.name}
                </option>
              ))}
            </Select>
          </div>
        )}

        {showProduct && (
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex gap-4 items-center">
            <div className="w-16 h-16 rounded-lg bg-white border border-slate-200 flex shrink-0 items-center justify-center overflow-hidden">
              {showProduct.imageThumb || showProduct.image ? (
                <img
                  src={showProduct.imageThumb! ?? showProduct.image}
                  alt={showProduct.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <MdImage className="text-gray-300 text-3xl" />
              )}
            </div>
            <div>
              <h4 className="font-bold text-slate-800 leading-tight">
                {showProduct.name}
              </h4>
              <p className="text-xs text-slate-500 font-mono mt-1">
                SKU Original: {showProduct.sku}
              </p>
              <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-primary/10 text-primary">
                Valor Original: {showProduct.defaultPrice ?? showProduct.price}{" "}
                pts
              </div>
            </div>
          </div>
        )}

        <div className="space-y-5 border-t border-slate-100 pt-5 mt-5">
          <Input
            label="Tu Precio para este producto"
            type="number"
            leftIcon={<LuDollarSign />}
            placeholder="Ej. 1500.00"
            className="text-lg font-bold"
            error={errors.customPrice}
            {...register("customPrice", { valueAsNumber: true })}
          />

          <Input
            label="Tu SKU Personalizado (Opcional)"
            placeholder="Ej. MI-SKU-001"
            hint="Si lo dejas en blanco, se usará el SKU original del maestro."
            error={errors.customSku}
            {...register("customSku")}
          />

          <Textarea
            label="Notas Internas (Opcional)"
            placeholder="Anotaciones sobre este producto, margen de ganancia, etc..."
            rows={3}
            error={errors.notes}
            {...register("notes")}
          />
        </div>
      </form>
    </Drawer>
  );
}
