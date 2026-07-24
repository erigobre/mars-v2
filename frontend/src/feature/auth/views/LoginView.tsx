import { useAuthStore } from "@/core/stores/authStore";
import {
  loginSchema,
  type LoginForm,
} from "@/feature/auth/schemas/loginSchema";
import {
  useLoginMutation,
  usePublicDistributorsQuery,
} from "@/feature/auth/services/authServices";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

export default function LoginView() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token || !user) return;
    let dest = "/home";
    if (user.role === "admin") dest = "/admin/home";
    if (user.role === "distributor") dest = "/distributor/home";
    if (user.role === "logistics") dest = "/logistics";
    navigate(dest, { replace: true });
  }, [token, user, navigate]);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
    watch,
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const { data: distributors, isLoading: isLoadingDistributors } =
    usePublicDistributorsQuery();
  const { mutate: loginMutation, isPending } = useLoginMutation(setError);
  const onSubmit = (data: LoginForm) => loginMutation(data);

  const selectedDistributor = watch("distributorId");

  return (
    <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-10 lg:gap-16 items-center min-h-[85vh]  lg:pb-[10vh]">
      <section className="flex flex-col items-center animate-in fade-in slide-in-from-left duration-700 w-full relative md:px-24 lg:px-0 lg:pb-24">
        <div
          className="w-full aspect-video bg-(image:--logo-main) bg-contain bg-no-repeat bg-center"
          role="img"
          aria-label="Logo Frigolazo"
        />

        <p className="w-full text-white font-extrabold text-2xl md:text-xl xl:text-3xl uppercase leading-tight tracking-wide text-center">
          Entre más chocolates vendas, más posibilidades tienes para ganar
        </p>
      </section>

      <section className="w-full max-w-sm mx-auto lg:ml-auto lg:mr-0 flex flex-col items-center lg:items-end">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full flex flex-col space-y-6"
        >
          {/* <div className="flex flex-col gap-2">
            <label className="text-white text-xs md:text-sm font-black uppercase tracking-widest px-6 drop-shadow-sm">
              Usuario / Folio
            </label>
            <input
              {...register("phone")}
              placeholder="Ingresa tu celular"
              className={`
                w-full h-16 px-8 rounded-2xl border-white bg-theme-light-accent text-brandBlue font-extrabold text-2xl md:text-lg border-2 outline-none transition-all placeholder:text-brandBlue/40 
                ${errors.phone
                  ? "border-danger ring-2 ring-danger/20"
                  : "border-transparent focus:ring-4 focus:ring-white/30"}
              `}
            />
            {errors.phone && (
              <p className="text-red-500 text-xs font-bold px-6 italic">
                {errors.phone.message}
              </p>
            )}
          </div> */}

          <div className="flex flex-col gap-2">
            <label className="text-white text-xs md:text-sm font-black uppercase tracking-widest px-6 drop-shadow-sm">
              Perfil / Distribuidor
            </label>
            <select
              {...register("distributorId")}
              className={`w-full h-16 px-8 rounded-2xl border-white bg-theme-light-accent text-brandBlue font-extrabold text-lg md:text-lg border-2 outline-none transition-all appearance-none cursor-pointer ${
                errors.distributorId
                  ? "border-danger ring-2 ring-danger/20"
                  : "border-transparent focus:ring-4 focus:ring-white/30"
              }`}
            >
              <option value="">Sin distribuidor</option>
              {distributors?.map((dist) => (
                <option key={dist.id} value={dist.id}>
                  {dist.companyName}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-white text-xs md:text-sm font-black uppercase tracking-widest px-6 drop-shadow-sm">
              {selectedDistributor ? "Identificador de Acceso" : "Teléfono"}
            </label>
            <input
              {...register("identifier")}
              placeholder={
                selectedDistributor
                  ? "Ingresa tu identificador"
                  : "Ingresa tu celular"
              }
              className={`
                w-full h-16 px-8 rounded-2xl border-white bg-theme-light-accent text-brandBlue font-extrabold text-2xl md:text-lg border-2 outline-none transition-all placeholder:text-brandBlue/40 
                ${errors.identifier ? "border-danger ring-2 ring-danger/20" : "border-transparent focus:ring-4 focus:ring-white/30"}
              `}
            />
            {errors.identifier && (
              <p className="text-red-500 text-xs font-bold px-6 italic">
                {errors.identifier.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-white text-xs md:text-sm font-black uppercase tracking-widest px-6 drop-shadow-sm">
              Contraseña
            </label>
            <input
              {...register("password")}
              type="password"
              placeholder="••••••••"
              className={`w-full h-16 px-8 rounded-2xl border-white bg-theme-light-accent text-brandBlue font-extrabold text-2xl md:text-lg border-2 outline-none transition-all placeholder:text-brandBlue/40 ${
                errors.password
                  ? "border-danger ring-2 ring-danger/20"
                  : "border-transparent focus:ring-4 focus:ring-white/30"
              }`}
            />
            {errors.password && (
              <p className="text-red-500 text-xs font-bold px-6 italic">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="pt-4 space-y-4 w-full">
            <button
              disabled={isPending || isLoadingDistributors}
              type="submit"
              className="w-full bg-theme-secondary h-20 hover:brightness-110 active:scale-[0.97] text-white font-black rounded-full text-xl transition-all uppercase tracking-widest shadow-lg cursor-pointer"
            >
              {isPending ? "Validando..." : "Entrar"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/register")}
              className="w-full h-20 bg-theme-warning hover:brightness-110 active:scale-[0.97] text-white font-black rounded-full text-sm transition-all uppercase tracking-widest border-2 border-white shadow-lg cursor-pointer"
            >
              Solicita acceso a tu distribuidor
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
