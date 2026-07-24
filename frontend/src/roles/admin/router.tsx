import { lazy } from "react";
import { Navigate, type RouteObject } from "react-router-dom";
import AdminLayout from "./AdminLayout";
// import SellerDetailsView from "@/feature/management/sellers/views/SellerDetailsView";
// import { DailyUsageView } from "@/feature/analytics/views/DailyUsageView";
// import { ActivityLogsView } from "@/feature/admin/views/ActivityLogsView";

const CampaingsView = lazy(() => import("@/feature/admin/views/CampaingsView"));
const CampaignDetailsView = lazy(
  () => import("@/feature/admin/views/CampaignDetailsView")
);
const RewardDetailsView = lazy(
  () => import("@/feature/admin/views/RewardDetailsView")
);
const RewardsView = lazy(() => import("@/feature/admin/views/RewardsView"));
const DistributorsView = lazy(
  () => import("@/feature/admin/views/DistributorsView")
);
const ProductsView = lazy(
  () => import("@/feature/products/views/ProductsView")
);
const SellersView = lazy(
  () => import("@/feature/management/sellers/views/SellersView")
);
const RewardClaimsView = lazy(
  () => import("@/feature/reward-claims/views/RewardClaimsView")
);
const RewardClaimDetailView = lazy(
  () => import("@/feature/reward-claims/views/RewardClaimDetailView")
);
const GoalsView = lazy(() => import("@/feature/admin/views/GoalsView"));
const GoalDetailsView = lazy(
  () => import("@/feature/admin/views/GoalDetailsView")
);
const SalesView = lazy(() => import("@/feature/sales/views/SalesView"));
const UploadSalesView = lazy(
  () => import("@/feature/sales/views/UploadSalesView")
);
const SaleDetailsView = lazy(
  () => import("@/feature/sales/views/SaleDetailsView")
);
const AdminDashboardView = lazy(
  () => import("@/feature/dashboard/views/AdminDashboardView")
);

const OverviewView = lazy(
  () => import("@/feature/analytics/views/OverviewView")
);
const SalesPerformanceView = lazy(
  () => import("@/feature/analytics/views/SalesPerformanceView")
);
const EconomyRewardsView = lazy(
  () => import("@/feature/analytics/views/EconomyRewardsView")
);
const AdoptionGamificationView = lazy(
  () => import("@/feature/analytics/views/AdoptionGamificationView")
);
const ActivityLogsView = lazy(
  () => import("@/feature/admin/views/ActivityLogsView")
);
const AdminProfileView = lazy(
  () => import("@/feature/profile/views/AdminProfileView")
);
const DisplaysView = lazy(() => import("@/feature/admin/views/DisplaysView"));
const LogisticsView = lazy(() => import("@/feature/admin/views/LogisticsView"));

const SellerTiersView = lazy(
  () => import("@/feature/seller-tiers/views/SellerTiersView")
);

const TierPriceMatrixView = lazy(
  () => import("@/feature/seller-tiers/views/TierPriceMatrixView")
);

const NotFoundView = lazy(() => import("@/core/views/NotFoundView"));

const SellerDetailsView = lazy(() => import("@/feature/management/sellers/views/SellerDetailsView"));
const DailyUsageView = lazy(() => import("@/feature/analytics/views/DailyUsageView"));
const SellerAdoptionView = lazy(() => import("@/feature/analytics/views/SellerAdoptionView"));

export const adminRoutes: RouteObject[] = [
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { index: true, element: <Navigate to="/admin/home" replace /> },
      { path: "home", element: <AdminDashboardView /> },
      { path: "distributors", element: <DistributorsView /> },
      { path: "sellers", element: <SellersView /> },
      { path: "sellers/tiers", element: <SellerTiersView /> },
      { path: "sellers/tiers/matrix", element: <TierPriceMatrixView /> },
      { path: "sellers/:id", element: <SellerDetailsView /> },
      { path: "logistics", element: <LogisticsView /> },
      { path: "displays", element: <DisplaysView /> },
      { path: "products", element: <ProductsView /> },
      {
        path: "campaigns",
        children: [
          { index: true, element: <CampaingsView /> },
          { path: ":id", element: <CampaignDetailsView /> },
        ],
      },
      {
        path: "rewards",
        children: [
          { index: true, element: <RewardsView /> },
          { path: ":id", element: <RewardDetailsView /> },
        ],
      },
      {
        path: "reward-claims",
        children: [
          { index: true, element: <RewardClaimsView /> },
          { path: ":id", element: <RewardClaimDetailView /> },
        ],
      },
      {
        path: "goals",
        children: [
          { index: true, element: <GoalsView /> },
          { path: ":id", element: <GoalDetailsView /> },
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
      { path: "profile", element: <AdminProfileView /> },
      {
        path: "analytics",
        children: [
          { index: true, path: "overview", element: <OverviewView /> },
          { path: "sales", element: <SalesPerformanceView /> },
          { path: "economy", element: <EconomyRewardsView /> },
          { path: "gamification", element: <AdoptionGamificationView /> },
          { path: "logs", element: <ActivityLogsView /> },
          { path: "usage", element: <DailyUsageView /> },
          { path: "seller-adoption", element: <SellerAdoptionView /> },
        ],
      },
      { path: "*", element: <NotFoundView />, handle: { hideHeader: true, hideNav: true } }
    ],
  },
];
