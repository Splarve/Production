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
      <div className="flex min-h-screen w-full flex-col">
        <header className="border-b h-14 flex items-center px-6 sticky top-0 bg-background z-20 w-full">
          <div className="font-semibold">Splarve Dashboard</div>
        </header>
        
        <div className="flex flex-1 w-full">
          <CompanySidebar handle={handle} currentPath={currentPath} />
          
          {/* Main content */}
          <main className="flex-1 min-w-0 overflow-y-auto p-6">
            <div className="mx-auto w-full max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
} 