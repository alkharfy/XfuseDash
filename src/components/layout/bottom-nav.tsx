"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/hooks/use-auth";
import { getLinksForRole, getTabsForRole } from "@/lib/roles";
import { cn } from "@/lib/utils";

export default function BottomNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { role } = useAuthStore();

  if (!role) {
    return null; // Or a loading skeleton
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
    
    return pathname === href;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t shadow-lg md:hidden">
      <div className="flex justify-around items-center h-16">
        {links.slice(0, 5).map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex flex-col items-center justify-center text-muted-foreground w-full h-full transition-colors",
              isLinkActive(link.href)
                ? "text-primary bg-primary/5"
                : "hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <link.icon className="h-6 w-6 mb-1" />
            <span className="text-xs font-medium">{link.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
