import DashboardLayout from "@/core/layouts/DashboardLayout";
import type { NavItem } from "@/core/types";
import {
  MdHome,
  MdPeople,
  MdInventory,
  MdSwapHoriz,
  MdAttachMoney,
  MdUploadFile,
  MdPerson,
  MdAnalytics,
  MdLocalShipping,
  MdTrendingUp,
} from "react-icons/md";

const DISTRIBUTOR_NAV_ITEMS: NavItem[] = [
  { to: "/distributor/home", label: "Inicio", icon: MdHome },
  { to: "/distributor/sellers", label: "Vendedores", icon: MdPeople },
  { to: "/distributor/products", label: "Productos", icon: MdInventory },
  {
    to: "/distributor/reward-claims",
    label: "Gestión de Canjes",
    icon: MdSwapHoriz,
  },
  { to: "/distributor/sales", label: "Ventas", icon: MdAttachMoney },
  {
    to: "/distributor/sales/upload",
    label: "Cargar Ventas",
    icon: MdUploadFile,
  },
  {
    label: "Analíticas",
    icon: MdAnalytics,
    to: "/distributor/analytics",
    children: [
      { 
        label: "Red Comercial", 
        to: "/distributor/analytics/commercial", 
        icon: MdTrendingUp
      },
      { 
        label: "Seguimiento Premios", 
        to: "/distributor/analytics/rewards", 
        icon: MdLocalShipping 
      },
    ]
  },
  { to: "/distributor/profile", label: "Perfil", icon: MdPerson },
];

export default function DistributorLayout() {
  return <DashboardLayout navItems={DISTRIBUTOR_NAV_ITEMS} />;
}
