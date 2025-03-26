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
    <SidebarProvider>
      <div className="flex min-h-screen flex-col">
        <div className="flex flex-1">
          <CompanySidebar handle={handle} currentPath={currentPath} />
          
          {/* Main content */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
} 