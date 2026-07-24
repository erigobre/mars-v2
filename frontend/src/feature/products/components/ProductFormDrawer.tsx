import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  MdAddCircle,
  MdAttachMoney,
  MdCategory,
  MdEdit,
  MdInventory,
  MdQrCode,
} from "react-icons/md";
import { Drawer } from "@/core/components/ui/Drawer";
import { Button, Input, Select, Textarea } from "@/core/components/ui";
import { Switch } from "@/core/components/ui/Switch";
import { ImageDropzone } from "@/core/components/ui/ImageDropzone";
import {
  productFormSchema,
  UNIT_TYPE_OPTIONS,
  type Product,
  type ProductFormData,
} from "../schemas/product";
import {
  useCreateProductMutation,
  useUpdateProductMutation,
} from "../services/productServices";
import { useDisplaysQuery } from "@/feature/admin/services/displayServices";

type ProductFormDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
};

export default function ProductFormDrawer({
  isOpen,
  onClose,
  productToEdit,
}: ProductFormDrawerProps) {
  const isEditing = !!productToEdit;
  const [imageFile, setImageFile] = useState<File | null>(null);

  const { data: dataDisplays, isLoading: isLoadingDisplays } =
    useDisplaysQuery(1, 1000);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    mode: "onChange",
    defaultValues: {
      displayId: undefined,
      sku: "",
      upc: "",
      name: "",
      description: "",
      defaultPrice: undefined,
      unitType: "PIECE",
      customUnitType: "",
      category: "",
      isActive: true,
    },
  });

  const unitType = watch("unitType");

  useEffect(() => {
    if (productToEdit && isOpen) {
      reset({
        displayId: productToEdit.display?.id ?? undefined,
        sku: productToEdit.sku,
        upc: productToEdit.upc ?? "",
        name: productToEdit.name,
        description: productToEdit.description ?? "",
        defaultPrice:
          productToEdit.defaultPrice ?? productToEdit.price ?? undefined,
        unitType: productToEdit.unitType,
        customUnitType: productToEdit.customUnitType ?? "",
        category: productToEdit.category ?? "",
        isActive: productToEdit.isActive,
      });
      setImageFile(null);
    } else if (!isOpen) {
      reset({
        displayId: undefined,
        sku: "",
        upc: "",
        name: "",
        description: "",
        defaultPrice: undefined,
        unitType: "PIECE",
        customUnitType: "",
        category: "",
        isActive: true,
      });
      setImageFile(null);
    }
  }, [productToEdit, isOpen, reset]);

  const { mutate: createProduct, isPending: isCreating } =
    useCreateProductMutation({ setError, onClose });
  const { mutate: updateProduct, isPending: isUpdating } =
    useUpdateProductMutation({ setError, onClose });
  const isPending = isCreating || isUpdating;

  const displays = dataDisplays?.items ?? [];

  const onSubmit = (data: ProductFormData) => {
    if (isEditing) {
      updateProduct({ id: productToEdit.id, formData: data, imageFile });
    } else {
      createProduct({ formData: data, imageFile });
    }
  };

  const FooterActions = (
    <div className="flex flex-col gap-3">
      <Button
        variant="primary"
        size="lg"
        fullWidth
        loading={isPending}
        onClick={handleSubmit(onSubmit)}
        className="shadow-lg shadow-primary/20"
      >
        {isEditing ? "Guardar Cambios" : "Crear Producto"}
      </Button>
      <Button
        variant="ghost"
        fullWidth
        onClick={onClose}
        className="text-gray-500"
      >
        Cancelar
      </Button>
    </div>
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Editar Producto" : "Nuevo Producto"}
      icon={isEditing ? <MdEdit /> : <MdAddCircle />}
      footer={FooterActions}
      isDirty={isDirty || imageFile !== null}
    >
      <form className="space-y-5">
        {/* Imagen */}
        <ImageDropzone
          label="Imagen del producto"
          initialImage={productToEdit?.image ?? undefined}
          onFileChange={setImageFile}
          error={errors.root?.message}
        />

        {/* Display */}
        <div className="border-t border-gray-100 pt-5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
            Información general
          </p>

          <div className="space-y-4">
            {isLoadingDisplays ? (
              <div className="h-14 bg-gray-100 rounded-2xl animate-pulse" />
            ) : (
              <Select
                label="Display"
                error={errors.displayId?.message}
                {...register("displayId", {
                  setValueAs: (v) => (v === "" ? undefined : Number(v)),
                })}
              >
                <option value="">Selecciona un display...</option>
                {displays.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                    {d.valuePoints ? ` · ${d.valuePoints} pts/u` : ""}
                  </option>
                ))}
              </Select>
            )}

            <Input
              label="Nombre"
              placeholder="Ej. Paleta Bomba Chocolate"
              leftIcon={<MdInventory />}
              error={errors.name}
              {...register("name")}
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="SKU"
                placeholder="Ej. PAL-001"
                leftIcon={<MdQrCode />}
                error={errors.sku}
                {...register("sku")}
              />
              <Input
                label="UPC (opcional)"
                placeholder="Código de barras"
                error={errors.upc}
                {...register("upc")}
              />
            </div>

            <Textarea
              label="Descripción"
              placeholder="Describe el producto..."
              rows={3}
              error={errors.description}
              {...register("description")}
            />
          </div>
        </div>

        {/* Precio y clasificación */}
        <div className="border-t border-gray-100 pt-5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
            Precio y clasificación
          </p>
          <div className="space-y-4">
            <Input
              label="Precio base"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              leftIcon={<MdAttachMoney />}
              error={errors.defaultPrice}
              {...register("defaultPrice", { valueAsNumber: true })}
            />

            <Select
              label="Tipo de unidad"
              error={errors.unitType?.message}
              {...register("unitType")}
            >
              <option value="">Selecciona un tipo...</option>
              {UNIT_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>

            {unitType === "SPECIFY" && (
              <Input
                label="Unidad personalizada"
                placeholder="Ej. Bolsa de 5 kg"
                error={errors.customUnitType}
                {...register("customUnitType")}
              />
            )}

            <Input
              label="Categoría (opcional)"
              placeholder="Ej. Paletas, Helados..."
              leftIcon={<MdCategory />}
              error={errors.category}
              {...register("category")}
            />
          </div>
        </div>

        {/* Estado */}
        <div className="border-t border-gray-100 pt-5">
          <Switch
            label="Producto activo"
            description="Visible para distribuidores y vendedores"
            error={errors.isActive}
            checked={watch("isActive")}
            {...register("isActive")}
          />
        </div>
      </form>
    </Drawer>
  );
}
