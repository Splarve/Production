'use client';

import Link from 'next/link';
import { 
  Building, 
  Briefcase, 
  Settings, 
  Users, 
  LayoutDashboard,
  Home,
  ChevronLeft,
  Menu
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface CompanySidebarProps {
  handle: string;
  currentPath: string;
}

export function CompanySidebar({ handle, currentPath }: CompanySidebarProps) {
  // Don't render the sidebar if we're not in a company-specific page
  if (!handle) return null;
  
  const { state, toggleSidebar } = useSidebar();
  
  // Updated isActive function for more precise path matching
  const isActive = (path: string) => {
    // Exact match for paths
    if (currentPath === path) return true;
    
    // Special case for dashboard path to avoid triggering on sub-paths
    if (path === `/dashboard/company/${handle}` && currentPath === `/dashboard/company/${handle}`) {
      return true;
    }
    
    // For other pages, check if current path starts with the nav item path
    // But only for nested routes (not the company home or main dashboard)
    if (path !== `/dashboard/company` && path !== `/dashboard/company/${handle}`) {
      return currentPath.startsWith(path);
    }
    
    return false;
  };

  // Company navigation items
  const navigationItems = [
    {
      title: "Toggle Sidebar",
      icon: state === 'expanded' ? ChevronLeft : Menu,
      onClick: toggleSidebar,
    },
    {
      title: "Company Home",
      url: `/dashboard/company`,
      icon: Home,
    },
    {
      title: "Dashboard",
      url: `/dashboard/company/${handle}`,
      icon: LayoutDashboard,
    },
    {
      title: "Jobs",
      url: `/dashboard/company/${handle}/jobs`,
      icon: Briefcase,
    },
    {
      title: "Team Members",
      url: `/dashboard/company/${handle}/members`,
      icon: Users,
    },
    {
      title: "Company Profile",
      url: `/dashboard/company/${handle}/edit`,
      icon: Building,
    },
    {
      title: "Settings",
      url: `/dashboard/company/${handle}/settings`,
      icon: Settings,
    }
  ];

  return (
    <Sidebar 
      className="transition-all duration-300 h-screen bg-[#f8f5ff] p-0 overflow-hidden"
      collapsible="icon"
      side="left"
    >
      <SidebarHeader className="bg-[#f8f5ff] p-0">
        <div className="py-6 bg-[#f8f5ff]">
          <div className="flex items-center justify-center gap-2 font-semibold px-4">
            <Building className="h-6 w-6 text-[#8f00ff]" />
            {state === 'expanded' && (
              <span className="text-lg transition-opacity duration-200 bg-gradient-to-r from-[#8f00ff] to-[#c9a0ff] bg-clip-text text-transparent">Splarve</span>
            )}
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="flex-1 overflow-y-auto bg-[#f8f5ff]">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[#4b0076] font-medium">
            Company Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item, index) => (
                <SidebarMenuItem key={index}>
                  {item.url ? (
                    <SidebarMenuButton 
                      asChild
                      className={cn(
                        "hover:bg-[#c9a0ff]/10 hover:text-[#8f00ff]",
                        isActive(item.url) ? 'bg-[#c9a0ff]/20 text-[#8f00ff]' : ''
                      )}
                    >
                      <Link href={item.url} className="flex items-center gap-2">
                        <item.icon className={cn("h-5 w-5", isActive(item.url) ? "text-[#8f00ff]" : "")} />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  ) : (
                    <SidebarMenuButton 
                      onClick={item.onClick}
                      aria-label={item.title}
                      className="flex items-center gap-2 hover:bg-[#c9a0ff]/10 hover:text-[#8f00ff]"
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{state === 'expanded' ? item.title : ''}</span>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t p-4 bg-[#f8f5ff]">
        <div className="text-xs text-muted-foreground">
          {state === 'expanded' && (
            <>
              <span className="font-medium text-[#8f00ff]">Splarve</span> • Company Dashboard
            </>
          )}
        </div>
      </SidebarFooter>
      
      <SidebarRail className="bg-[#f8f5ff]" />
    </Sidebar>
  );
}