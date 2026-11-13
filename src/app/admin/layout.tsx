import React, { Suspense } from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#F7FAFC]">
      <Suspense fallback={<div className="w-60 bg-white border-r border-[#EDF2F7]" />}>
        <AdminSidebar />
      </Suspense>
      <div className="flex-1 flex flex-col min-w-0">
        <Suspense fallback={<div className="h-16 bg-white border-b border-[#EDF2F7]" />}>
          <AdminTopbar />
        </Suspense>
        <main className="flex-1 p-6 sm:p-8 max-w-[1440px] w-full mx-auto">
          <Suspense fallback={<div className="py-8 text-center text-sm text-[#545F72]">Carregando painel...</div>}>
            {children}
          </Suspense>
        </main>
      </div>
    </div>
  );
}
