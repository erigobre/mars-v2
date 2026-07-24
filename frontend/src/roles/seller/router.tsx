import type { RouteObject } from "react-router-dom";
import AppLayout from "./AppLayout";
import { lazy } from "react";
import RequireTerms from "@/core/components/auth/RequireTerms";
import PrivacyView from "@/feature/sellers/views/PrivacyView";
import SellerNotFoundView from "@/feature/sellers/views/SellerNotFoundView";

const HomeView = lazy(() => import("@/feature/sellers/views/HomeView"));
const RewardsView = lazy(() => import("@/feature/sellers/views/RewardsView"));
const RankingView = lazy(() => import("@/feature/sellers/views/RankingView"));
const ProfileView = lazy(() => import("@/feature/sellers/views/ProfileView"));
const ClaimEntryView = lazy(
  () => import("@/feature/sellers/views/ClaimEntryView")
);
const ShippingClaimView = lazy(
  () => import("@/feature/sellers/views/ShippingClaimView")
);
const ConfirmClaimView = lazy(
  () => import("@/feature/sellers/views/ConfirmClaimView")
);
const SuccessClaimView = lazy(
  () => import("@/feature/sellers/views/SuccessClaimView")
);
const TermsView = lazy(() => import("@/feature/sellers/views/TermsView"));

export const sellerRoutes: RouteObject[] = [
  {
    element: <RequireTerms />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            path: "/home",
            element: <HomeView />,
          },
          {
            path: "/rewards",
            children: [
              {
                index: true,
                element: <RewardsView />,
              },
              {
                path: "claim/:rewardId",
                children: [
                  {
                    index: true,
                    element: <ClaimEntryView />,
                    handle: { hideHeader: true, hideNav: true },
                  },
                  {
                    path: ":claimId",
                    children: [
                      {
                        path: "shipping",
                        element: <ShippingClaimView />,
                        handle: { hideHeader: true, hideNav: true },
                      },
                      {
                        path: "confirm",
                        element: <ConfirmClaimView />,
                        handle: { hideHeader: true, hideNav: true },
                      },
                      {
                        path: "success",
                        element: <SuccessClaimView />,
                        handle: { hideHeader: true, hideNav: true },
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            path: "/ranking",
            element: <RankingView />,
          },
          {
            path: "/profile",
            element: <ProfileView />,
          },
          {
            path: "/terms",
            element: <TermsView />,
          },
          {
            path: "/privacy",
            element: <PrivacyView />
          },
          {
            path: "*",
            element: <SellerNotFoundView />,
            handle: { hideHeader: true, hideNav: false }, // Opcional: si quieres ocultar el menú/header en el 404
          }
        ],
      },
    ],
  },
];
