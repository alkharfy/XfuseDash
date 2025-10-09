
"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useAuthStore } from "@/hooks/use-auth";
import { getLinksForRole, getTabsForRole } from "@/lib/roles";
import { Zap } from "lucide-react";


export default function SidebarNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { role } = useAuthStore();
  
  if (!role) {
    return (
      <Sidebar className="border-e hidden md:block" collapsible="icon">
        {/* Placeholder or loading state for sidebar */}
      </Sidebar>
    );
  }

  const links = getLinksForRole(role);

  const isLinkActive = (href: string) => {
    const linkPath = href.split('?')[0];
    if (linkPath !== pathname) return false;

    const currentTab = searchParams.get('tab');
    const linkTab = new URLSearchParams(href.split('?')[1] || '').get('tab');

    if (linkTab) {
      const defaultTab = getTabsForRole(role)[0]?.value;
      return linkTab === (currentTab || defaultTab);
    }
    
    // For links without a tab (like /dashboard), it's active if the path matches.
    return pathname === href;
  };

  return (
    <Sidebar className="border-e" collapsible="icon">
      <SidebarHeader className="flex items-center justify-between p-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <Zap className="h-6 w-6 text-primary" />
          <span className="font-headline text-lg group-data-[collapsible=icon]:hidden">MarketFlow</span>
        </Link>
        <SidebarTrigger className="hidden md:flex" />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {links.map((link) => (
            <SidebarMenuItem key={link.href}>
              <SidebarMenuButton
                asChild
                isActive={isLinkActive(link.href)}
                tooltip={{ children: link.label }}
              >
                <Link href={link.href}>
                  <link.icon className="h-5 w-5" />
                  <span>{link.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        {/* Footer content can go here */}
      </SidebarFooter>
    </Sidebar>
  );
}
