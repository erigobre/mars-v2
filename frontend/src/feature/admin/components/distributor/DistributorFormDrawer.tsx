import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  MdAddCircle,
  MdBusiness,
  MdEdit,
  MdEmail,
  MdPerson,
  MdPhone,
  MdSecurity,
} from "react-icons/md";
import { Drawer } from "@/core/components/ui/Drawer";
import { Button, Input, Select } from "@/core/components/ui"; // <-- Importamos Select
import { Switch } from "@/core/components/ui/Switch";
import { ImageDropzone } from "@/core/components/ui/ImageDropzone";
import {
  CREDENTIAL_LABELS,
  distributorFormSchema,
  IDENTIFIER_LABELS,
  type CredentialType,
  type Distributor,
  type DistributorFormData,
  type IdentifierType,
} from "../../schemas/distributor";
import {
  useCreateDistributorMutation,
  useUpdateDistributorMutation,
} from "../../services/distributorServices";

type DistributorFormDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  distributorToEdit?: Distributor | null;
};

export default function DistributorFormDrawer({
  isOpen,
  onClose,
  distributorToEdit,
}: DistributorFormDrawerProps) {
  const isEditing = !!distributorToEdit;
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<DistributorFormData>({
    resolver: zodResolver(distributorFormSchema),
    mode: "onChange",
    defaultValues: {
      username: "",
      email: "",
      phone: "",
      birthdate: "",
      companyName: "",
      isActive: true,
      pointsCalculationStrategy: "",
      growthPercentage: "",
      averageEvaluationScope: "",
      password: "",
      passwordConfirmation: "",
      identifierType: "phone" as IdentifierType,
      credentialType: "birthdate" as CredentialType,
    },
  });

  useEffect(() => {
    if (distributorToEdit && isOpen) {
      let strategy = distributorToEdit.pointsCalculationStrategy;
      if (strategy === "display_based") strategy = "display";
      if (strategy === "average_based") strategy = "average";

      reset({
        username: distributorToEdit.username,
        email: distributorToEdit.email,
        phone: distributorToEdit.phone,
        birthdate: distributorToEdit.birthdate?.split("T")[0] ?? "",
        companyName: distributorToEdit.companyName,
        isActive: distributorToEdit.isActive,

        pointsCalculationStrategy: (strategy as any) ?? "",
        growthPercentage: distributorToEdit.growthPercentage ?? "",
        averageEvaluationScope:
          (distributorToEdit.averageEvaluationScope as any) ?? "",

        identifierType: distributorToEdit.identifierType || "phone",
        credentialType: distributorToEdit.credentialType || "birthdate",

        password: "",
        passwordConfirmation: "",
      });
      setAvatarFile(null);
    } else if (!isOpen) {
      reset({
        username: "",
        email: "",
        phone: "",
        birthdate: "",
        companyName: "",
        isActive: true,
        pointsCalculationStrategy: "",
        growthPercentage: "",
        averageEvaluationScope: "",
        password: "",
        passwordConfirmation: "",
        identifierType: "phone" as IdentifierType,
        credentialType: "birthdate" as CredentialType,
      });
      setAvatarFile(null);
    }
  }, [distributorToEdit, isOpen, reset]);

  const { mutate: createDistributor, isPending: isCreating } =
    useCreateDistributorMutation({ setError, onClose });
  const { mutate: updateDistributor, isPending: isUpdating } =
    useUpdateDistributorMutation({ setError, onClose });
  const isPending = isCreating || isUpdating;

  const onSubmit = (data: DistributorFormData) => {
    // Transformamos los strings vacíos a null antes de enviar a la API
    const sanitizedData = {
      ...data,
      pointsCalculationStrategy:
        data.pointsCalculationStrategy === ""
          ? null
          : data.pointsCalculationStrategy,
      averageEvaluationScope:
        data.averageEvaluationScope === "" ? null : data.averageEvaluationScope,
    };

    if (isEditing) {
      updateDistributor({
        id: distributorToEdit.id,
        formData: sanitizedData,
        avatarFile,
      });
    } else {
      createDistributor({ formData: sanitizedData, avatarFile });
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
        {isEditing ? "Guardar Cambios" : "Crear Distribuidor"}
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
      title={isEditing ? "Editar Distribuidor" : "Nuevo Distribuidor"}
      icon={isEditing ? <MdEdit /> : <MdAddCircle />}
      footer={FooterActions}
      isDirty={isDirty || avatarFile !== null}
    >
      <form className="space-y-5">
        <ImageDropzone
          label="Avatar"
          variant="circle"
          initialImage={distributorToEdit?.avatarUrl ?? undefined}
          onFileChange={setAvatarFile}
          error={errors.root?.message}
        />

        <div className="border-t border-gray-100 pt-5 space-y-1">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Datos de la cuenta
          </p>
        </div>

        <Input
          label="Nombre de usuario"
          placeholder="Ej. Juan Pérez"
          leftIcon={<MdPerson />}
          error={errors.username}
          {...register("username")}
        />

        <Input
          label="Correo electrónico"
          type="email"
          placeholder="correo@empresa.com"
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

        <Input
          label="Fecha de nacimiento"
          type="date"
          error={errors.birthdate}
          {...register("birthdate")}
        />

        <div className="border-t border-gray-100 pt-5 space-y-1">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Datos del distribuidor
          </p>
        </div>

        <Input
          label="Nombre de la empresa"
          placeholder="Ej. Distribuciones del Norte S.A."
          leftIcon={<MdBusiness />}
          error={errors.companyName}
          {...register("companyName")}
        />

        <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <MdSecurity className="text-slate-400 text-lg" />
            <p className="text-sm font-bold text-slate-700">
              Accesos Vendedores
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Identificador (Login)"
              error={errors.identifierType?.message}
              {...register("identifierType")}
            >
              {Object.entries(IDENTIFIER_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>

            <Select
              label="Contraseña"
              error={errors.credentialType?.message}
              {...register("credentialType")}
            >
              {Object.entries(CREDENTIAL_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </div>
          <p className="text-[10px] text-slate-500 leading-tight">
            Nota: Si modificas estos campos en un distribuidor existente, el
            sistema intentará reasignar los accesos de todos sus vendedores.
          </p>
        </div>

        <div className="border-t border-gray-100 pt-5 space-y-1">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Configuración Comercial
          </p>
        </div>

        {/* --- NUEVOS CAMPOS AQUÍ --- */}
        <Select
          label="Estrategia de Cálculo de Puntos"
          error={errors.pointsCalculationStrategy?.message}
          {...register("pointsCalculationStrategy")}
        >
          <option value="">Por defecto (Heredado / Estándar)</option>
          <option value="display">Display</option>
          <option value="average">Promedio (Average)</option>
        </Select>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="% de Crecimiento"
            type="number"
            step="0.01"
            placeholder="Ej. 15.5"
            error={errors.growthPercentage}
            {...register("growthPercentage")}
          />

          <Select
            label="Alcance de Evaluación"
            error={errors.averageEvaluationScope?.message}
            {...register("averageEvaluationScope")}
          >
            <option value="">No definido</option>
            <option value="cycle">Por Ciclo</option>
            <option value="campaign">Por Campaña</option>
          </Select>
        </div>
        {/* --- FIN NUEVOS CAMPOS --- */}

        <Switch
          label="Cuenta activa"
          description="El distribuidor puede iniciar sesión"
          error={errors.isActive}
          checked={watch("isActive")}
          {...register("isActive")}
        />
      </form>
    </Drawer>
  );
}
