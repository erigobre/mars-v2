import { Skeleton } from "@/core/components/ui/Skeleton";

export default function ProfileLoadingCard() {
  return (
    // Contenedor estático que no parpadea
    <div className="w-full max-w-5xl mx-auto mt-4 md:mt-0 bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100">
      {/* Mock Cabecera Unificada */}
      <div className="p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 border-b border-gray-100">
        <Skeleton className="w-32 h-32 md:w-40 md:h-40 rounded-full shrink-0" />
        <div className="text-center md:text-left flex-1 space-y-4 w-full">
          <Skeleton className="h-10 w-3/4 mx-auto md:mx-0 rounded-lg" />
          <div className="flex flex-wrap justify-center md:justify-start gap-4">
            <Skeleton className="h-10 w-28 rounded-xl" />
            <Skeleton className="h-10 w-40 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Mock Contenido Formulario */}
      <div className="p-8 md:p-12 space-y-12">
        <section className="space-y-8">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            <div className="md:col-span-2">
              <Skeleton className="h-16 w-full rounded-2xl" />
            </div>
            <div>
              <Skeleton className="h-16 w-full rounded-2xl" />
            </div>
            <div>
              <Skeleton className="h-16 w-full rounded-2xl" />
            </div>
          </div>
        </section>

        {/* Mock Botones de Acción */}
        <div className="flex flex-col md:flex-row justify-end items-center gap-6 pt-12 border-t border-gray-100">
          <Skeleton className="h-12 w-full md:w-32 rounded-xl" />
          <Skeleton className="h-14 w-full md:w-48 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
