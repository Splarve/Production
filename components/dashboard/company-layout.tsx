'use client';
// components/dashboard/company-layout.tsx
import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { Building, Menu, Users, Briefcase, Shield, Settings } from 'lucide-react';

interface NavProps {
  isCollapsed: boolean;
  links: {
    title: string;
    label?: string;
    icon: React.ReactNode;
    variant: 'default' | 'ghost';
    href: string;
    requirePermission?: string;
    userPermissions?: Record<string, boolean>;
    hideIfNoPermission?: boolean;
  }[];
}

function Nav({ links, isCollapsed }: NavProps) {
  const pathname = usePathname();

  // Filter links based on permissions
  const filteredLinks = links.filter(link => {
    // No permission required or explicit permission check not needed
    if (!link.requirePermission) return true;
    
    // Hide if no permission and hideIfNoPermission is true
    if (link.hideIfNoPermission && !link.userPermissions?.[link.requirePermission]) {
      return false;
    }
    
    return true;
  });

  return (
    <div
      data-collapsed={isCollapsed}
      className="group flex flex-col gap-4 py-2 data-[collapsed=true]:py-2"
    >
      <nav className="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
        {filteredLinks.map((link, index) => (
          <Link
            key={index}
            href={link.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
              pathname === link.href
                ? "bg-[#c9a0ff]/20 text-[#8f00ff]"
                : "text-muted-foreground hover:bg-[#c9a0ff]/10 hover:text-[#8f00ff]",
              isCollapsed && "group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:h-10 group-[[data-collapsed=true]]:w-10 group-[[data-collapsed=true]]:px-0"
            )}
          >
            {link.icon}
            {!isCollapsed && <span>{link.title}</span>}
            {!isCollapsed && link.label && (
              <span
                className="ml-auto bg-[#c9a0ff]/20 text-[#8f00ff] rounded-full px-2 py-0.5 text-xs font-semibold"
              >
                {link.label}
              </span>
            )}
          </Link>
        ))}
      </nav>
    </div>
  );
}

interface CompanyLayoutProps {
  children: ReactNode;
  handle: string;
  currentPath: string;
}

export function CompanyLayout({ children, handle, currentPath }: CompanyLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userPermissions, setUserPermissions] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileOpen, setMobileOpen] = useState(false);
  
  // Fetch user permissions for this company
  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const response = await fetch(`/api/companies/${handle}/user-permissions`);
        const data = await response.json();
        
        if (response.ok) {
          setUserPermissions(data.permissions || {});
        } else {
          console.error('Error fetching permissions:', data.error);
        }
      } catch (error) {
        console.error('Error fetching permissions:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPermissions();
  }, [handle]);
  
  // Define navigation links with permission requirements
  const links = [
    {
      title: "Overview",
      icon: <Building className="h-4 w-4" />,
      variant: "default",
      href: `/dashboard/company/${handle}`,
    },
    {
      title: "Team Members",
      icon: <Users className="h-4 w-4" />,
      variant: "ghost",
      href: `/dashboard/company/${handle}/members`,
      requirePermission: "view_members",
    },
    {
      title: "Jobs",
      icon: <Briefcase className="h-4 w-4" />,
      variant: "ghost",
      href: `/dashboard/company/${handle}/jobs`,
      requirePermission: "create_job_post",
    },
    {
      title: "Roles & Permissions",
      icon: <Shield className="h-4 w-4" />,
      variant: "ghost",
      href: `/dashboard/company/${handle}/roles`,
      requirePermission: "manage_roles",
      hideIfNoPermission: true,
    },
    {
      title: "Settings",
      icon: <Settings className="h-4 w-4" />,
      variant: "ghost",
      href: `/dashboard/company/${handle}/settings`,
      requirePermission: "manage_company_profile",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-col sm:flex-row flex-1">
        {/* Mobile sidebar */}
        <Sheet open={isMobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="fixed left-4 top-4 z-40 sm:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-60 sm:hidden">
            <div className="py-4">
              <h2 className="text-lg font-semibold text-[#4b0076] mb-6 pl-4">
                Company Dashboard
              </h2>
              <ScrollArea className="h-[calc(100vh-8rem)]">
                <Nav links={links.map(link => ({ ...link, userPermissions }))} isCollapsed={false} />
              </ScrollArea>
            </div>
          </SheetContent>
        </Sheet>

        {/* Desktop sidebar */}
        <aside
          className="hidden sm:flex border-r bg-white w-14 lg:w-60 flex-col"
          style={{ minHeight: "calc(100vh - 4rem)" }}
        >
          <ScrollArea className="flex-1">
            <div className="flex h-full flex-col py-4">
              <div className="px-4 py-2">
                <h2 className="mb-2 text-lg font-semibold text-[#4b0076] tracking-tight lg:block hidden">
                  Company Dashboard
                </h2>
                <div className="lg:block hidden">
                  <p className="text-sm text-muted-foreground mb-4">
                    @{handle}
                  </p>
                </div>
              </div>
              <Nav 
                links={links.map(link => ({ ...link, userPermissions }))} 
                isCollapsed={isCollapsed} 
              />
            </div>
          </ScrollArea>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}