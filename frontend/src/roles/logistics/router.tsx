import { lazy } from "react";
import { Navigate, type RouteObject } from "react-router-dom";
import LogisticsLayout from "./LogisticsLayout";

const OverviewView = lazy(
  () => import("@/feature/analytics/views/OverviewView")
);
// const SalesPerformanceView = lazy(
//   () => import("@/feature/analytics/views/SalesPerformanceView")
// );
const EconomyRewardsView = lazy(
  () => import("@/feature/analytics/views/EconomyRewardsView")
);
const AdoptionGamificationView = lazy(
  () => import("@/feature/analytics/views/AdoptionGamificationView")
);
// const SellerAdoptionView = lazy(
//   () => import("@/feature/analytics/views/SellerAdoptionView")
// );
// También les puede interesar ver la tabla de canjes cruda
const RewardClaimsView = lazy(
  () => import("@/feature/reward-claims/views/RewardClaimsView")
);
const RewardClaimDetailView = lazy(
  () => import("@/feature/reward-claims/views/RewardClaimDetailView")
);

// const DailyUsageView = lazy(
//   () => import("@/feature/analytics/views/DailyUsageView")
// );

export const logisticsRoutes: RouteObject[] = [
  {
    path: "/logistics",
    element: <LogisticsLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/logistics/analytics/economy" replace />,
      },
      {
        path: "analytics",
        children: [
          { index: true, element: <Navigate to="economy" replace /> },
          { path: "overview", element: <OverviewView /> },
          // { path: "sales", element: <SalesPerformanceView /> },
          { path: "economy", element: <EconomyRewardsView /> },
          { path: "gamification", element: <AdoptionGamificationView /> },
          // { path: "seller-adoption", element: <SellerAdoptionView /> },
          // { path: "usage", element: <DailyUsageView /> },
        ],
      },
      {
        path: "reward-claims",
        children: [
          { index: true, element: <RewardClaimsView /> },
          { path: ":id", element: <RewardClaimDetailView /> },
        ],
      },
    ],
  },
];
