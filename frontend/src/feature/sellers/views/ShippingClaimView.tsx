import { useProfileQuery } from "@/feature/profile/services/profileServices";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  type ShippingFormData,
  shippingFormSchema,
} from "../schemas/rewardClaim";
import { useRewardClaimDetailsQuery } from "@/feature/reward-claims/services/rewardClaimServices";

export default function ShippingClaimView() {
  const { rewardId, claimId } = useParams<{
    rewardId: string;
    claimId: string;
  }>();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    isLoading: isLoadingClaim,
    isError: isErrorClaim,
    error: claimError,
  } = useRewardClaimDetailsQuery(Number(claimId));

  const { data: profileData } = useProfileQuery();
  const profile = profileData;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ShippingFormData>({
    resolver: zodResolver(shippingFormSchema),
    defaultValues: {
      shippingName: "",
      shippingStreet: "",
      shippingColonia: "",
      shippingCity: "",
      shippingState: "",
      shippingZip: "",
      shippingNotes: "",
      saveToProfile: true,
    },
  });

  useEffect(() => {
    const shippingFromRoute = location.state?.shippingData as
      | ShippingFormData
      | undefined;

    if (shippingFromRoute) {
      reset(shippingFromRoute);
    } else if (profile?.address) {
      reset({
        shippingName: profile.username ?? "",
        shippingStreet: profile.address.street ?? "",
        shippingColonia: profile.address.colonia ?? "",
        shippingCity: profile.address.city ?? "",
        shippingState: profile.address.state ?? "",
        shippingZip: profile.address.zip ?? "",
        shippingNotes: profile.shippingNotes ?? "",
        saveToProfile: false,
      });
    }
  }, [profile, reset, location.state]);

  useEffect(() => {
    if (!isLoadingClaim && isErrorClaim && claimError) {
      navigate(`/rewards`, {
        replace: true,
      });
    }
  }, [isLoadingClaim, isErrorClaim, claimError, navigate, rewardId, claimId]);

  const onSubmit = (data: ShippingFormData) => {
    navigate(`/rewards/claim/${rewardId}/${claimId}/confirm`, {
      state: { shippingData: data },
    });
  };

  if (isLoadingClaim) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-secondary/20 border-t-secondary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="px-6 pt-2 pb-4">
        <h3 className="text-white tracking-tight text-3xl font-bold leading-tight text-left">
          ¿A dónde enviamos tu premio?
        </h3>
        <p className="text-white/80 mt-2 text-lg">
          Por favor, ingresa los detalles de tu domicilio para la entrega.
        </p>
      </div>

      <div className="flex flex-col gap-6 px-6 py-4 w-full">
        <label className="flex flex-col w-full">
          <span className="text-white text-xs md:text-sm font-black uppercase tracking-widest px-6 pb-2 drop-shadow-sm">
            Nombre quien recibe
          </span>
          <input
            {...register("shippingName")}
            placeholder="Ej. Juan Pérez García"
            type="text"
            className={`w-full h-16 px-8 rounded-2xl bg-theme-light-accent text-brandBlue font-extrabold text-2xl md:text-lg border-2 outline-none transition-all placeholder:text-brandBlue/40 ${
              errors.shippingName
                ? "border-yellow-300 ring-2 ring-yellow-300/50"
                : "border-white focus:ring-4 focus:ring-white/30"
            }`}
          />
          {errors.shippingName && (
            <span className="text-yellow-300 text-sm font-bold mt-2 px-6 drop-shadow-md">
              {errors.shippingName.message}
            </span>
          )}
        </label>

        <label className="flex flex-col w-full">
          <span className="text-white text-xs md:text-sm font-black uppercase tracking-widest px-6 pb-2 drop-shadow-sm">
            Calle y Número
          </span>
          <input
            {...register("shippingStreet")}
            placeholder="Ej. Av. Reforma 123 Int 4"
            type="text"
            className={`w-full h-16 px-8 rounded-2xl bg-theme-light-accent text-brandBlue font-extrabold text-2xl md:text-lg border-2 outline-none transition-all placeholder:text-brandBlue/40 ${
              errors.shippingStreet
                ? "border-yellow-300 ring-2 ring-yellow-300/50"
                : "border-white focus:ring-4 focus:ring-white/30"
            }`}
          />
          {errors.shippingStreet && (
            <span className="text-yellow-300 text-sm font-bold mt-2 px-6 drop-shadow-md">
              {errors.shippingStreet.message}
            </span>
          )}
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <label className="flex flex-col">
            <span className="text-white text-xs md:text-sm font-black uppercase tracking-widest px-6 pb-2 drop-shadow-sm">
              Código Postal (C.P.)
            </span>
            <input
              {...register("shippingZip")}
              placeholder="00000"
              type="text"
              maxLength={5}
              className={`w-full h-16 px-8 rounded-2xl bg-theme-light-accent text-brandBlue font-extrabold text-2xl md:text-lg border-2 outline-none transition-all placeholder:text-brandBlue/40 ${
                errors.shippingZip
                  ? "border-yellow-300 ring-2 ring-yellow-300/50"
                  : "border-white focus:ring-4 focus:ring-white/30"
              }`}
            />
            {errors.shippingZip && (
              <span className="text-yellow-300 text-sm font-bold mt-2 px-6 drop-shadow-md">
                {errors.shippingZip.message}
              </span>
            )}
          </label>
          <label className="flex flex-col">
            <span className="text-white text-xs md:text-sm font-black uppercase tracking-widest px-6 pb-2 drop-shadow-sm">
              Colonia
            </span>
            <input
              {...register("shippingColonia")}
              placeholder="Nombre de la colonia"
              type="text"
              className={`w-full h-16 px-8 rounded-2xl bg-theme-light-accent text-brandBlue font-extrabold text-2xl md:text-lg border-2 outline-none transition-all placeholder:text-brandBlue/40 ${
                errors.shippingColonia
                  ? "border-yellow-300 ring-2 ring-yellow-300/50"
                  : "border-white focus:ring-4 focus:ring-white/30"
              }`}
            />
            {errors.shippingColonia && (
              <span className="text-yellow-300 text-sm font-bold mt-2 px-6 drop-shadow-md">
                {errors.shippingColonia.message}
              </span>
            )}
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <label className="flex flex-col w-full">
            <span className="text-white text-xs md:text-sm font-black uppercase tracking-widest px-6 pb-2 drop-shadow-sm">
              Ciudad / Municipio
            </span>
            <input
              {...register("shippingCity")}
              placeholder="Ej. Ciudad de México"
              type="text"
              className={`w-full h-16 px-8 rounded-2xl bg-theme-light-accent text-brandBlue font-extrabold text-2xl md:text-lg border-2 outline-none transition-all placeholder:text-brandBlue/40 ${
                errors.shippingCity
                  ? "border-yellow-300 ring-2 ring-yellow-300/50"
                  : "border-white focus:ring-4 focus:ring-white/30"
              }`}
            />
            {errors.shippingCity && (
              <span className="text-yellow-300 text-sm font-bold mt-2 px-6 drop-shadow-md">
                {errors.shippingCity.message}
              </span>
            )}
          </label>
          <label className="flex flex-col w-full">
            <span className="text-white text-xs md:text-sm font-black uppercase tracking-widest px-6 pb-2 drop-shadow-sm">
              Estado
            </span>
            <input
              {...register("shippingState")}
              placeholder="Ej. Jalisco"
              type="text"
              className={`w-full h-16 px-8 rounded-2xl bg-theme-light-accent text-brandBlue font-extrabold text-2xl md:text-lg border-2 outline-none transition-all placeholder:text-brandBlue/40 ${
                errors.shippingState
                  ? "border-yellow-300 ring-2 ring-yellow-300/50"
                  : "border-white focus:ring-4 focus:ring-white/30"
              }`}
            />
            {errors.shippingState && (
              <span className="text-yellow-300 text-sm font-bold mt-2 px-6 drop-shadow-md">
                {errors.shippingState.message}
              </span>
            )}
          </label>
        </div>

        <label className="flex flex-col w-full">
          <span className="text-white text-xs md:text-sm font-black uppercase tracking-widest px-6 pb-2 drop-shadow-sm">
            Referencias <span className="text-white/70 font-bold lowercase tracking-normal">(opcional)</span>
          </span>
          <textarea
            {...register("shippingNotes")}
            rows={3}
            className={`w-full py-5 px-8 rounded-2xl bg-theme-light-accent text-brandBlue font-extrabold text-2xl md:text-lg border-2 outline-none transition-all placeholder:text-brandBlue/40 resize-none ${
              errors.shippingNotes
                ? "border-yellow-300 ring-2 ring-yellow-300/50"
                : "border-white focus:ring-4 focus:ring-white/30"
            }`}
            placeholder="Ej. Casa blanca, portón negro. Teléfono 555-1234..."
          />
          {errors.shippingNotes && (
            <span className="text-yellow-300 text-sm font-bold mt-2 px-6 drop-shadow-md">
              {errors.shippingNotes.message}
            </span>
          )}
        </label>

        <label className="flex items-center gap-4 mt-2 cursor-pointer group bg-transparent backdrop-blur-sm rounded-full border-2 border-white py-2 px-4">
          <div className="relative flex items-center">
            <input
              type="checkbox"
              className="peer w-6 h-6 rounded border-2 border-white bg-transparent text-secondary focus:ring-white focus:ring-offset-0 cursor-pointer transition-all"
              {...register("saveToProfile")}
            />
          </div>
          <span className="text-lg text-white font-bold drop-shadow-md group-hover:scale-[1.02] transition-transform">
            Guardar esta dirección para futuros canjes
          </span>
        </label>

        <div className="mt-8">
          <button
            onClick={handleSubmit(onSubmit)}
            className="w-full bg-theme-primary hover:bg-theme-primary/90 cursor-pointer text-white font-bold text-xl py-5 rounded-2xl shadow-lg shadow-black/20 transition-transform active:scale-95 uppercase tracking-wider"
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}