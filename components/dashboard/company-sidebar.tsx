'use client';

import Link from 'next/link';
import { 
  Building, 
  Briefcase, 
  Settings, 
  Users, 
  LayoutDashboard,
  ChevronLeft
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
} from "@/components/ui/sidebar";

interface CompanySidebarProps {
  handle: string;
  currentPath: string;
}

export function CompanySidebar({ handle, currentPath }: CompanySidebarProps) {
  // Don't render the sidebar if we're not in a company-specific page
  if (!handle) return null;

  const isActive = (path: string) => {
    return currentPath === path || (path !== `/dashboard/company/${handle}` && currentPath.startsWith(path));
  };

  // Company navigation items
  const navigationItems = [
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
    <Sidebar collapsible="icon">
      <SidebarHeader className="flex h-14 items-center border-b px-4">
        <Link href="/dashboard/company" className="flex items-center gap-2 font-semibold">
          <ChevronLeft className="h-4 w-4" />
          <span>All Companies</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Company Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    className={isActive(item.url) ? 'bg-muted' : ''}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <div className="flex flex-col gap-2">
          <div className="text-xs text-muted-foreground">
            <span className="font-medium">Splarve</span> • Company Dashboard
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
} 