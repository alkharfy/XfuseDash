
"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/hooks/use-auth";
import { getLinksForRole, getTabsForRole } from "@/lib/roles";
import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SidebarNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { role } = useAuthStore();
  
  if (!role) {
    return (
      <aside className="hidden md:block w-64 flex-shrink-0 border-r bg-card">
        {/* Placeholder or loading state for sidebar */}
      </aside>
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
    <aside className="hidden md:flex md:flex-col md:w-64 md:flex-shrink-0 border-r bg-card">
        <div className="h-16 flex items-center px-6 border-b">
             <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
                <Zap className="h-6 w-6 text-primary" />
                <span className="font-headline text-lg">xfuse</span>
            </Link>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {links.map((link) => (
             <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted",
                isLinkActive(link.href) && "bg-muted text-primary"
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </nav>
    </aside>
  );
}
