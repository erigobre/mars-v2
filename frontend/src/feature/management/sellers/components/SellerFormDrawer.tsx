import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  MdAddCircle,
  MdAttachMoney,
  MdBusiness,
  MdEdit,
  MdEmail,
  MdHomeWork,
  MdLocationOn,
  MdMap,
  MdPerson,
  MdPhone,
  MdPinDrop,
  MdSignpost,
} from "react-icons/md";
import { Drawer } from "@/core/components/ui/Drawer";
import { Button, Input, Select, Textarea } from "@/core/components/ui";
import { Switch } from "@/core/components/ui/Switch";
import { ImageDropzone } from "@/core/components/ui/ImageDropzone";
import {
  sellerFormSchema,
  type Seller,
  type SellerFormData,
} from "../schemas/seller";
import { useDistributorsQuery } from "@/feature/admin/services/distributorServices";
import {
  useCreateSellerMutation,
  useUpdateSellerMutation,
} from "../services/sellerServices";
import { useAuthStore } from "@/core/stores/authStore";
import { useSellerTiersQuery } from "@/feature/seller-tiers/services/sellerTierServices";

type SellerFormDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  sellerToEdit?: Seller | null;
};

export default function SellerFormDrawer({
  isOpen,
  onClose,
  sellerToEdit,
}: SellerFormDrawerProps) {
  const isEditing = !!sellerToEdit;
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "admin";

  // Fetch distributors for the select
  const { data: distributorsData } = useDistributorsQuery(1, 100, {}, { enabled: isAdmin });
  const distributorOptions = [
    { value: "", label: "Selecciona un distribuidor..." },
    ...(distributorsData?.items ?? []).map((d) => ({
      value: String(d.id),
      label: d.companyName,
    })),
  ];

  const { data: tiersData } = useSellerTiersQuery(1, 100, { isActive: true });

  const {
    register,
    handleSubmit,
    setError,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<SellerFormData>({
    resolver: zodResolver(sellerFormSchema),
    mode: "onChange",
    defaultValues: {
      username: "",
      email: "",
      phone: "",
      birthdate: "",
      distributorId: undefined,
      employeeCode: "",
      isActive: true,
      password: "",
      passwordConfirmation: "",
      addressStreet: "",
      addressColonia: "",
      addressCity: "",
      addressState: "",
      addressZip: "",
      shippingNotes: "",
      averageMonthlySales: 0,
      sellerTierId: "",
    },
  });

  useEffect(() => {
    if (sellerToEdit && isOpen) {
      reset({
        username: sellerToEdit.username,
        email: sellerToEdit.email ?? "",
        phone: sellerToEdit.phone ?? "",
        distributorId: sellerToEdit.distributor?.id,
        employeeCode: sellerToEdit.employeeCode ?? "",
        isActive: sellerToEdit.isActive ?? false,
        password: "",
        passwordConfirmation: "",
        addressStreet: sellerToEdit.address?.street ?? "",
        addressColonia: sellerToEdit.address?.colonia ?? "",
        addressCity: sellerToEdit.address?.city ?? "",
        addressState: sellerToEdit.address?.state ?? "",
        addressZip: sellerToEdit.address?.zip ?? "",
        shippingNotes: sellerToEdit.shippingNotes ?? "",
        averageMonthlySales: sellerToEdit.averageMonthlySales ?? 0,
        sellerTierId: sellerToEdit.tier?.id ? String(sellerToEdit.tier.id) : "",
      });
      setAvatarFile(null);
    } else if (!isOpen) {
      reset({
        username: "",
        email: "",
        phone: "",
        birthdate: "",
        distributorId: undefined,
        employeeCode: "",
        isActive: true,
        password: "",
        passwordConfirmation: "",
        addressStreet: "",
        addressColonia: "",
        addressCity: "",
        addressState: "",
        addressZip: "",
        shippingNotes: "",
        averageMonthlySales: 0,
      });
      setAvatarFile(null);
    }
  }, [sellerToEdit, isOpen, reset]);

  const { mutate: createSeller, isPending: isCreating } =
    useCreateSellerMutation({ setError, onClose });
  const { mutate: updateSeller, isPending: isUpdating } =
    useUpdateSellerMutation({ setError, onClose });
  const isPending = isCreating || isUpdating;

  const selectedDistributorId = watch("distributorId");

  const availableTiers = (tiersData?.items ?? []).filter(
    (t) => t.distributorId == null || String(t.distributorId) === String(selectedDistributorId)
  );

  const onSubmit = (data: SellerFormData) => {
    if (isEditing) {
      updateSeller({ id: sellerToEdit.id, formData: data, avatarFile });
    } else {
      createSeller({ formData: data, avatarFile });
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
        {isEditing ? "Guardar Cambios" : "Crear Vendedor"}
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
      title={isEditing ? "Editar Vendedor" : "Nuevo Vendedor"}
      icon={isEditing ? <MdEdit /> : <MdAddCircle />}
      footer={FooterActions}
      isDirty={isDirty || avatarFile !== null}
    >
      <form className="space-y-5">
        <ImageDropzone
          label="Avatar"
          variant="circle"
          initialImage={sellerToEdit?.avatarUrl ?? undefined}
          onFileChange={setAvatarFile}
        />

        {/* Datos de cuenta */}
        <div className="border-t border-gray-100 pt-5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
            Datos de la cuenta
          </p>
          <div className="space-y-4">
            <Input
              label="Nombre de usuario"
              placeholder="Ej. María López"
              leftIcon={<MdPerson />}
              error={errors.username}
              {...register("username")}
            />
            <Input
              label="Correo electrónico"
              type="email"
              placeholder="correo@ejemplo.com"
              leftIcon={<MdEmail />}
              error={errors.email}
              {...register("email")}
            />
            <Input
              label="Teléfono"
              type="tel"
              placeholder="10 dígitos"
              leftIcon={<MdPhone />}
              error={errors.phone}
              {...register("phone")}
            />
            {!isEditing && (
              <Input
                label="Fecha de nacimiento"
                type="date"
                error={errors.birthdate}
                {...register("birthdate")}
              />
            )}
          </div>
        </div>

        {/* Datos del vendedor */}
        <div className="border-t border-gray-100 pt-5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
            Datos del vendedor
          </p>
          <div className="space-y-4">
            <Select
              label="Distribuidor"
              error={errors.distributorId?.message}
              options={distributorOptions}
              {...register("distributorId", {
                setValueAs: (v) => (v === "" ? undefined : Number(v)),
              })}
            >
              <option value="">Selecciona un distribuidor...</option>
              {(distributorsData?.items ?? []).map((d) => (
                <option key={d.id} value={d.id}>
                  {d.companyName}
                </option>
              ))}
            </Select>

            <Select
              label="Asignación Manual de Rango"
              error={errors.sellerTierId?.message}
              {...register("sellerTierId")}
              value={watch("sellerTierId") || ""}
              hint="Si lo dejas en automático, el sistema lo calculará en base a sus ventas mensuales."
            >
              <option value="">Automático / Sin rango</option>
              {availableTiers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} {t.distributorId ? "(Distribuidor)" : "(Global)"}
                </option>
              ))}
            </Select>

            <Input
              label="Código de empleado"
              placeholder="Ej. EMP-001"
              leftIcon={<MdBusiness />}
              error={errors.employeeCode}
              hint={
                isEditing
                  ? "Cambiar el código puede generar conflictos."
                  : undefined
              }
              {...register("employeeCode")}
            />

            <Input
              label="Ventas promedio mensuales"
              placeholder="Ej. 10000"
              leftIcon={<MdAttachMoney />}
              error={errors.averageMonthlySales}
              {...register("averageMonthlySales", { setValueAs: (v) => (v === "" ? null : Number(v)) })}
            />

            <Switch
              label="Cuenta activa"
              description="El vendedor puede iniciar sesión"
              error={errors.isActive}
              checked={watch("isActive")}
              onChange={(e) => 
                setValue("isActive", e.target.checked, { shouldDirty: true })
              }
            />
          </div>
        </div>

        {/* Dirección */}
        <div className="border-t border-gray-100 pt-5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
            Dirección de envío
          </p>
          <div className="space-y-4">
            <Input
              label="Calle y número"
              placeholder="Ej. Av. Reforma 222, Int. 4"
              leftIcon={<MdSignpost />}
              error={errors.addressStreet}
              {...register("addressStreet")}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Colonia"
                placeholder="Ej. Juárez"
                leftIcon={<MdHomeWork />}
                error={errors.addressColonia}
                {...register("addressColonia")}
              />
              <Input
                label="Ciudad"
                placeholder="Ej. CDMX"
                leftIcon={<MdLocationOn />}
                error={errors.addressCity}
                {...register("addressCity")}
              />
              <Input
                label="Estado"
                placeholder="Ej. CDMX"
                leftIcon={<MdMap />}
                error={errors.addressState}
                {...register("addressState")}
              />
              <Input
                label="C.P."
                placeholder="06600"
                maxLength={10}
                leftIcon={<MdPinDrop />}
                error={errors.addressZip}
                {...register("addressZip")}
              />
            </div>
            <Textarea
              label="Notas de envío"
              placeholder="Referencias o instrucciones especiales..."
              rows={3}
              error={errors.shippingNotes}
              {...register("shippingNotes")}
            />
          </div>
        </div>

        {/* Contraseña */}
        {/* <div className="border-t border-gray-100 pt-5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
            {isEditing ? "Cambiar contraseña (opcional)" : "Contraseña"}
          </p>
          {isEditing && (
            <p className="text-xs text-gray-400 mb-4">
              Deja en blanco para no cambiar la contraseña actual.
            </p>
          )}
          <div className="space-y-4 mt-4">
            <Input
              label="Contraseña"
              type="password"
              placeholder="Mínimo 8 caracteres"
              leftIcon={<MdLock />}
              error={errors.password}
              {...register("password")}
            />
            <Input
              label="Confirmar contraseña"
              type="password"
              placeholder="Repite la contraseña"
              leftIcon={<MdLock />}
              error={errors.passwordConfirmation}
              {...register("passwordConfirmation")}
            />
          </div>
        </div> */}
      </form>
    </Drawer>
  );
}
