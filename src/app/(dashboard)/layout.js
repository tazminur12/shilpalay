"use client";

import Sidebar from "../components/dashboard/Sidebar";
import Topbar from "../components/dashboard/Topbar";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Loading from "../components/ui/Loading";

export default function DashboardLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (status === "loading") return; // Still loading

    // Check if user is not logged in
    if (!session) {
      router.push("/login");
      return;
    }

    // Check if user has the required role (super_admin or admin)
    const allowedRoles = ["super_admin", "admin"];
    if (session.user?.role && !allowedRoles.includes(session.user.role)) {
      router.push("/");
      return;
    }
  }, [session, status, router]);

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <Loading 
        text="Loading dashboard..." 
        fullScreen 
        className="bg-gray-50"
      />
    );
  }

  // Show nothing if not authenticated or wrong role (redirect will happen)
  if (!session || !["super_admin", "admin"].includes(session.user?.role)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed lg:fixed inset-y-0 left-0 z-50 lg:z-30
        transform transition-transform duration-300 ease-in-out lg:transform-none
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        shrink-0
      `}>
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </aside>
      
      {/* Main Content */}
      <div className="flex flex-col min-w-0 w-full lg:ml-64 lg:max-w-[calc(100%-256px)]">
        <Topbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 p-4 lg:p-6 min-w-0 max-w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
