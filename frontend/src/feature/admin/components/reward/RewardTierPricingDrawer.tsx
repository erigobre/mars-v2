import { useState, useEffect } from "react";
import { Drawer, Button, Input } from "@/core/components/ui";
import {
  useRewardTierPrices,
  useUpdateRewardTierPrices,
} from "../../../rewards/services/rewardServices";
import { MdArrowForward } from "react-icons/md";
import { toast } from "react-toastify";
import TierBadge from "@/feature/seller-tiers/components/TierBadge";
import type { Reward } from "@/feature/rewards/schemas/reward";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  reward: Reward;
}

export default function RewardTierPricingDrawer({
  isOpen,
  onClose,
  reward,
}: Props) {
  const { data: tierPrices, isLoading } = useRewardTierPrices(reward.id);
  const updateMutation = useUpdateRewardTierPrices();
  const [formPrices, setFormPrices] = useState<Record<number, number>>({});

  useEffect(() => {
    if (tierPrices) {
      const initial: Record<number, number> = {};
      tierPrices.forEach((tp) => {
        initial[tp.tier!.id] = tp.price;
      });
      setFormPrices(initial);
    }
  }, [tierPrices]);

  const handleSave = async () => {
    const pricesArray = Object.entries(formPrices).map(([id, price]) => ({
      tierId: Number(id),
      price: price,
    }));

    try {
      await updateMutation.mutateAsync({
        rewardId: reward.id,
        prices: pricesArray,
      });
      toast.success("Precios por rango actualizados");
      onClose();
    } catch (e) {
      toast.error("Error al actualizar precios");
    }
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Precios por Rango">
      <div className="p-4 space-y-6 flex flex-col h-full">
        {/* Encabezado del Precio Base */}
        <div className="bg-gray-50 p-4 rounded-xl border border-dashed border-gray-300">
          <p className="text-sm font-semibold text-gray-500 mb-1">
            Precio Base del Producto
          </p>
          <p className="text-2xl font-black text-primary">
            {reward.pointsRequired} pts
          </p>
        </div>

        {/* Lista de Tiers */}
        <div className="space-y-4 flex-1 overflow-y-auto pr-2">
          {isLoading ? (
            <div className="text-center py-6 text-gray-500 text-sm">
              Cargando rangos...
            </div>
          ) : (
            tierPrices?.map((tp) => {
              const currentPrice = formPrices[tp.tier!.id] ?? tp.price;
              const difference = currentPrice - reward.pointsRequired;

              return (
                <div
                  key={tp.tier!.id}
                  className="p-4 border border-gray-200 rounded-xl bg-white shadow-sm space-y-4"
                >
                  <div className="flex justify-between items-center">
                    <TierBadge
                      name={tp.tier?.name ?? 'Rango sin nombre'}
                      color={tp.tier?.color}
                      icon={tp.tier?.icon}
                      size="sm"
                    />
                    {!tp.isCustom && (
                      <span className="text-[10px] bg-gray-100 px-2 py-1 rounded text-gray-500 uppercase font-bold tracking-wider">
                        Base
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 mb-1 font-medium">
                        Precio especial
                      </p>
                      <Input
                        type="number"
                        min={0}
                        value={currentPrice}
                        onChange={(e) =>
                          setFormPrices({
                            ...formPrices,
                            [tp.tier!.id]: Number(e.target.value),
                          })
                        }
                      />
                    </div>

                    <div className="text-xs text-gray-400 flex flex-col items-center min-w-15 pt-4">
                      <span className="font-medium">Dif.</span>
                      <MdArrowForward className="my-0.5 text-gray-300" />
                      <span
                        className={`font-bold ${difference < 0 ? "text-emerald-500" : difference > 0 ? "text-red-500" : "text-gray-500"}`}
                      >
                        {difference > 0 ? "+" : ""}
                        {difference}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Acciones */}
        <div className="flex gap-3 pt-4 border-t border-gray-100 mt-auto">
          <Button
            variant="ghost"
            className="flex-1"
            onClick={onClose}
            disabled={updateMutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            className="flex-1"
            onClick={handleSave}
            disabled={updateMutation.isPending}
          >
            Guardar Cambios
          </Button>
        </div>
      </div>
    </Drawer>
  );
}
