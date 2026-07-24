import { lazy } from "react";
import { Navigate, type RouteObject } from "react-router-dom";
import DistributorLayout from "./DistributorLayout";

const SellersView = lazy(
  () => import("@/feature/management/sellers/views/SellersView")
);
const RewardClaimsView = lazy(
  () => import("@/feature/reward-claims/views/RewardClaimsView")
);
const RewardClaimDetailView = lazy(
  () => import("@/feature/reward-claims/views/RewardClaimDetailView")
);
const SalesView = lazy(() => import("@/feature/sales/views/SalesView"));
const UploadSalesView = lazy(
  () => import("@/feature/sales/views/UploadSalesView")
);
const SaleDetailsView = lazy(
  () => import("@/feature/sales/views/SaleDetailsView")
);
const DistributorProductsView = lazy(
  () => import("@/feature/products/views/DistributorProductsView")
);
const DistributorProfileView = lazy(
  () => import("@/feature/profile/views/DistributorProfileView")
);
const DistributorDashboardView = lazy(
  () => import("@/feature/dashboard/views/DistributorDashboardView")
);
const CommercialNetworkView = lazy(
  () => import("@/feature/analytics/views/CommercialNetworkView")
);
const RewardsNetworkView = lazy(
  () => import("@/feature/analytics/views/RewardsNetworkView")
);

export const distributorRoutes: RouteObject[] = [
  {
    path: "/distributor",
    element: <DistributorLayout />,
    children: [
      { index: true, element: <Navigate to="/distributor/home" replace /> },
      { path: "home", element: <DistributorDashboardView /> },
      { path: "sellers", element: <SellersView /> },
      { path: "products", element: <DistributorProductsView /> },
      {
        path: "reward-claims",
        children: [
          { index: true, element: <RewardClaimsView /> },
          { path: ":id", element: <RewardClaimDetailView /> },
        ],
      },
      {
        path: "sales",
        children: [
          { index: true, element: <SalesView /> },
          { path: ":id", element: <SaleDetailsView /> },
          { path: "upload", element: <UploadSalesView /> },
        ],
      },
      {
        path: "analytics",
        children: [
          { index: true, element: <Navigate to="commercial" replace /> },
          { path: "commercial", element: <CommercialNetworkView /> },
          { path: "rewards", element: <RewardsNetworkView /> },
        ],
      },
      { path: "profile", element: <DistributorProfileView /> },
    ],
  },
];
