import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { MdArrowBack, MdCheckCircle } from "react-icons/md";
import {
  requestAccessSchema,
  type RequestAccessForm,
} from "../schemas/requestAccessSchema";
import {
  usePublicDistributorsQuery,
  useRegisterMutation,
} from "../services/authServices";
import { useState } from "react";

export default function RequestAccessView() {
  const navigate = useNavigate();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { data: distributors, isLoading } = usePublicDistributorsQuery();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RequestAccessForm>({
    resolver: zodResolver(requestAccessSchema),
    defaultValues: {
      username: "",
      email: "",
      phone: "",
      birthdate: "",
      distributor_id: "",
      employee_code: "",
    },
  });

  const { mutate: registerMutation, isPending: isSubmitting } =
    useRegisterMutation(setError);

  const onSubmit = (data: RequestAccessForm) => {
    registerMutation(data, {
      onSuccess: () => {
        setIsSubmitted(true);
      },
    });
  };

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center animate-in fade-in zoom-in duration-500">
        <div className="bg-secondary/20 p-6 rounded-full mb-8">
          <MdCheckCircle className="text-secondary text-9xl shadow-lg shadow-secondary/20" />
        </div>

        <h2 className="text-white text-4xl font-black uppercase tracking-tight mb-4">
          ¡Solicitud enviada!
        </h2>

        <p className="text-white/70 text-xl max-w-md leading-relaxed mb-10">
          Tu información ha sido recibida correctamente. Tu distribuidor
          revisará los datos y recibirás una notificación cuando tu acceso sea
          aprobado.
        </p>

        <button
          onClick={() => navigate("/")}
          className="w-full max-w-sm bg-secondary-light hover:bg-secondary-light/90 text-[#102218] font-bold text-xl py-5 rounded-2xl shadow-lg transition-transform active:scale-95 uppercase tracking-wider"
        >
          Volver al Login
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors cursor-pointer"
      >
        <MdArrowBack /> Volver al login
      </button>

      <div className="px-6 pt-2 pb-4">
        <h3 className="text-white tracking-tight text-3xl font-bold leading-tight text-left">
          Solicita tu acceso
        </h3>
        <p className="text-white/80 mt-2 text-lg">
          Completa tus datos para que tu distribuidor pueda validar tu cuenta.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-6 px-6 py-4 w-full"
      >
        <div className="flex flex-col gap-2 w-full">
          <label className="text-white text-xs md:text-sm font-black uppercase tracking-widest px-6 drop-shadow-sm">
            Nombre Completo
          </label>
          <input
            {...register("username")}
            placeholder="Ej. Juan Pérez García"
            className={`w-full h-16 px-8 rounded-2xl bg-theme-light-accent text-brandBlue font-extrabold text-2xl md:text-lg border-2 outline-none transition-all placeholder:text-brandBlue/40 ${
              errors.username
                ? "border-danger ring-2 ring-danger/20"
                : "border-white focus:ring-4 focus:ring-white/30"
            }`}
          />
          {errors.username && (
            <p className="text-danger text-xs font-bold px-6 italic">
              {errors.username.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-white text-xs md:text-sm font-black uppercase tracking-widest px-6 drop-shadow-sm">
              Correo Electrónico
            </label>
            <input
              {...register("email")}
              type="email"
              placeholder="correo@ejemplo.com"
              className={`w-full h-16 px-8 rounded-2xl bg-theme-light-accent text-brandBlue font-extrabold text-2xl md:text-lg border-2 outline-none transition-all placeholder:text-brandBlue/40 ${
                errors.email
                  ? "border-danger ring-2 ring-danger/20"
                  : "border-white focus:ring-4 focus:ring-white/30"
              }`}
            />
            {errors.email && (
              <p className="text-danger text-xs font-bold px-6 italic">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-white text-xs md:text-sm font-black uppercase tracking-widest px-6 drop-shadow-sm">
              Teléfono
            </label>
            <input
              {...register("phone")}
              placeholder="5512345678"
              className={`w-full h-16 px-8 rounded-2xl bg-theme-light-accent text-brandBlue font-extrabold text-2xl md:text-lg border-2 outline-none transition-all placeholder:text-brandBlue/40 ${
                errors.phone
                  ? "border-danger ring-2 ring-danger/20"
                  : "border-white focus:ring-4 focus:ring-white/30"
              }`}
            />
            {errors.phone && (
              <p className="text-danger text-xs font-bold px-6 italic">
                {errors.phone.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-white text-xs md:text-sm font-black uppercase tracking-widest px-6 drop-shadow-sm">
              Fecha de Nacimiento
            </label>
            <input
              {...register("birthdate")}
              type="date"
              className={`w-full h-16 px-8 rounded-2xl bg-theme-light-accent text-brandBlue font-extrabold text-2xl md:text-lg border-2 outline-none transition-all placeholder:text-brandBlue/40 ${
                errors.birthdate
                  ? "border-danger ring-2 ring-danger/20"
                  : "border-white focus:ring-4 focus:ring-white/30"
              }`}
            />
            {errors.birthdate && (
              <p className="text-danger text-xs font-bold px-6 italic">
                {errors.birthdate.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-white text-xs md:text-sm font-black uppercase tracking-widest px-6 drop-shadow-sm">
              Código de Empleado
            </label>
            <input
              {...register("employee_code")}
              placeholder="E-12345"
              className={`w-full h-16 px-8 rounded-2xl bg-theme-light-accent text-brandBlue font-extrabold text-2xl md:text-lg border-2 outline-none transition-all placeholder:text-brandBlue/40 ${
                errors.employee_code
                  ? "border-danger ring-2 ring-danger/20"
                  : "border-white focus:ring-4 focus:ring-white/30"
              }`}
            />
            {errors.employee_code && (
              <p className="text-danger text-xs font-bold px-6 italic">
                {errors.employee_code.message}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 w-full">
          <label className="text-white text-xs md:text-sm font-black uppercase tracking-widest px-6 drop-shadow-sm">
            Distribuidor
          </label>
          <select
            {...register("distributor_id")}
            disabled={isLoading}
            className={`w-full h-16 px-8 rounded-2xl bg-theme-light-accent text-brandBlue font-extrabold text-2xl md:text-lg border-2 outline-none transition-all placeholder:text-brandBlue/40 appearance-none disabled:opacity-50 ${
              errors.distributor_id
                ? "border-danger ring-2 ring-danger/20"
                : "border-white focus:ring-4 focus:ring-white/30"
            }`}
          >
            <option value="">
              {isLoading
                ? "Cargando distribuidores..."
                : "Selecciona tu distribuidor"}
            </option>
            {distributors?.map((dist) => (
              <option key={dist.id} value={dist.id}>
                {dist.companyName}
              </option>
            ))}
          </select>
          {errors.distributor_id && (
            <p className="text-danger text-xs font-bold px-6 italic">
              {errors.distributor_id.message}
            </p>
          )}
        </div>

        <div className="mt-8">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-secondary-light hover:bg-secondary-light/90 cursor-pointer text-[#102218] font-bold text-xl py-5 rounded-2xl shadow-lg shadow-primary/20 transition-transform active:scale-95 uppercase tracking-wider disabled:opacity-50"
          >
            {isSubmitting ? "Enviando..." : "Enviar Solicitud"}
          </button>
        </div>
      </form>
    </div>
  );
}
