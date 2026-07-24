import BottomDecoration from "@/core/components/common/BottomDecoration";
import SupportFooter from "@/core/components/common/SupportFooter";
import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="h-dvh bg-theme-accent bg-fixed font-sans antialiased overflow-hidden relative flex flex-col">
      <BottomDecoration />

      <div className="flex-1 w-full overflow-y-auto flex flex-col p-4 sm:px-10 sm:pt-10 sm:pb-20 relative z-10">
        <div className="w-full flex-1 flex flex-col items-center justify-center">
          <Outlet />
        </div>

        <div className="w-full shrink-0 mt-8 pb-2 lg:hidden">
          <SupportFooter />
        </div>
      </div>

      <div className="hidden lg:block absolute bottom-6 left-0 right-0 z-20 pointer-events-none">
        <SupportFooter />
      </div>
    </div>
  );
}