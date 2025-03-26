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

interface CompanySidebarProps {
  handle: string;
  currentPath: string;
}

export function CompanySidebar({ handle, currentPath }: CompanySidebarProps) {
  // Don't render the sidebar if we're not in a company-specific page
  if (!handle) return null;
  
  const { state, toggleSidebar } = useSidebar();
  const isActive = (path: string) => {
    return currentPath === path || (path !== `/dashboard/company/${handle}` && currentPath.startsWith(path));
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
      className="transition-all duration-300 h-[calc(100vh-3.5rem)]"
      collapsible="icon"
      side="left"
    >
      <SidebarHeader className="flex h-14 items-center border-b px-4">
        <div className="flex items-center gap-2 font-semibold">
          <Building className="h-5 w-5" />
          <span>Splarve</span>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="flex-1 overflow-y-auto">
        <SidebarGroup>
          <SidebarGroupLabel>Company Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item, index) => (
                <SidebarMenuItem key={index}>
                  {item.url ? (
                    <SidebarMenuButton 
                      asChild
                      className={isActive(item.url) ? 'bg-muted' : ''}
                    >
                      <Link href={item.url} className="flex items-center gap-2">
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  ) : (
                    <SidebarMenuButton 
                      onClick={item.onClick}
                      aria-label={item.title}
                      className="flex items-center gap-2"
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
      
      <SidebarFooter className="border-t p-4">
        <div className="text-xs text-muted-foreground">
          <span className="font-medium">Splarve</span> • Company Dashboard
        </div>
      </SidebarFooter>
      
      <SidebarRail />
    </Sidebar>
  );
}