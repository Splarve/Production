'use client';

import { SidebarProvider } from "@/components/ui/sidebar";
import { ReactNode } from "react";
import { CompanySidebar } from "./company-sidebar";

interface CompanyLayoutProps {
  children: ReactNode;
  handle: string;
  currentPath: string;
}

export function CompanyLayout({ children, handle, currentPath }: CompanyLayoutProps) {
  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen w-full">
        <CompanySidebar handle={handle} currentPath={currentPath} />
        
        {/* Main content */}
        <main className="flex-1 min-w-0 overflow-y-auto p-6">
          <div className="mx-auto w-full max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
} 