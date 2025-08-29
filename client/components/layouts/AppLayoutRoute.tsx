import { Outlet } from "react-router-dom";
import MainLayout from "@/components/layouts/MainLayout";

export default function AppLayoutRoute() {
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
}
