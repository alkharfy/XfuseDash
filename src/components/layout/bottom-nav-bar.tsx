"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/hooks/use-auth";
import { getLinksForRole } from "@/lib/roles";
import { cn } from "@/lib/utils";
import { getTabsForRole } from "@/lib/roles";

export default function BottomNavBar() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { role } = useAuthStore();

    if (!role) {
        return null;
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
        <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-card border-t md:hidden">
            <div className="grid h-full max-w-lg grid-cols-5 mx-auto font-medium">
                {links.slice(0, 5).map((link) => (
                     <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                            "inline-flex flex-col items-center justify-center px-2 hover:bg-muted group",
                            isLinkActive(link.href) ? "text-primary" : "text-muted-foreground"
                        )}
                    >
                        <link.icon className="w-5 h-5 mb-1" />
                        <span className="text-xs">{link.label}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
