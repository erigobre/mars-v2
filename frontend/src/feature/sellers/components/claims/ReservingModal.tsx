import { MdClose, MdErrorOutline } from "react-icons/md";
import { BaseModal } from "@/core/components/ui/Modal/BaseModal"; // Ajusta el path

type Props = {
  open: boolean;
  isReserving: boolean;
  errorMessage?: string | null;
  onBack: () => void;
};

export function ReservingModal({
  open,
  isReserving,
  errorMessage,
  onBack,
}: Props) {
  return (
    <BaseModal open={open} maxWidth="sm">
      <div className="flex flex-col items-center gap-5 text-center">
        {errorMessage ? (
          <>
            <div className="relative bg-red-50 px-6 py-5 border-b border-red-100 w-full">
              <button
                onClick={onBack}
                className="absolute top-4 right-4 w-7 h-7 bg-red-100 hover:bg-red-200 rounded-full flex items-center justify-center transition-colors"
              >
                <MdClose className="text-red-400 text-sm" />
              </button>
              <div className="flex items-center gap-3">
                <div className="bg-red-100 p-2.5 rounded-xl">
                  <MdErrorOutline className="text-red-500 text-2xl" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900">
                    Ocurrió un problema
                  </h3>
                </div>
              </div>
            </div>

            <div className="px-6 py-6">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <p className="font-semibold text-slate-800">
                  {errorMessage}
                </p>
              </div>
            </div>

            <div className="px-6 pb-6 w-full">
              <button
                onClick={onBack}
                className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-4 px-6 rounded-2xl transition-colors"
              >
                Volver a premios
              </button>
            </div>
          </>
        ) : (
          <div className="p-8 flex justify-center items-center flex-col gap-5">
            <div className="relative w-14 h-14">
              <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
              <div className="absolute inset-0 border-4 border-t-primary rounded-full animate-spin" />
            </div>
            <div>
              <p className="font-extrabold text-slate-900">
                {isReserving
                  ? "Reservando tu premio…"
                  : "Verificando..."}
              </p>
              <p className="text-slate-400 text-xs mt-1">
                Un momento por favor
              </p>
            </div>
          </div>
        )}
      </div>
    </BaseModal>
  );
}
