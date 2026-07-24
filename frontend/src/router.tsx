import { createBrowserRouter, Outlet } from "react-router-dom";
import AuthLayout from "./feature/auth/components/AuthLayout";
import { sellerRoutes } from "./roles/seller/router";
import { adminRoutes } from "./roles/admin/router";
import ProtectedRoute from "./core/components/auth/ProtectedRoute";
import { FullScreenLoader } from "./core/components/common/FullScreenLoader";
import { lazy, Suspense } from "react";
import { distributorRoutes } from "./roles/distributor/router";
import MandatoryTermsView from "./feature/sellers/views/MandatoryTermsView";
import { logisticsRoutes } from "./roles/logistics/router";

const LoginView = lazy(() => import("./feature/auth/views/LoginView"));
const RequestAccessView = lazy(() => import("./feature/auth/views/RequestAccessView"));

const router = createBrowserRouter([
  {
    element: (
      <Suspense fallback={<FullScreenLoader />}>
        <Outlet />
      </Suspense>
    ),
    children: [
      {
        element: <AuthLayout />,
        children: [
          { 
            path: "/",
            element: <LoginView /> 
          },
          {
            path: "/register",
            element: <RequestAccessView />
          },
          {
            path: "/accept-terms",
            element: <MandatoryTermsView />
          }
        ],
      },
      {
        element: <ProtectedRoute allowed={["seller"]} />,
        children: sellerRoutes
      },
      {
        element: <ProtectedRoute allowed={["admin"]} />,
        children: adminRoutes
      },
      {
        element: <ProtectedRoute allowed={["distributor"]} />,
        children: distributorRoutes
      },
      {
        element: <ProtectedRoute allowed={["logistics"]} />,
        children: logisticsRoutes
      },
    ]
  }
]);

export default router;
