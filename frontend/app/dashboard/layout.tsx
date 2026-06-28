"use client";

import { Loader2 } from "lucide-react";

import { MobileNav } from "../../components/dashboard/MobileNav";
import { Sidebar } from "../../components/dashboard/Sidebar";
import { useAuth } from "../../hooks/useAuth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading } = useAuth(true);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand-fuchsia" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 flex flex-col pb-16 md:pb-0 min-w-0">
        {children}
      </main>
      <MobileNav />
    </div>
  );
}
