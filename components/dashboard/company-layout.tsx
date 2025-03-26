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
      <div className="flex min-h-screen flex-col">
        <header className="border-b h-14 flex items-center px-6 sticky top-0 bg-background z-20">
          <div className="font-semibold">Splarve Dashboard</div>
        </header>
        
        <div className="flex flex-1 relative">
          <CompanySidebar handle={handle} currentPath={currentPath} />
          
          {/* Main content */}
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
} 