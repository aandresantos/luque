import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";

function AppLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen flex-col lg:flex-row">
        <AppSidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

export { AppLayout };
