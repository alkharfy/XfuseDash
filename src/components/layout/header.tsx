"use client";

import { UserNav } from "./user-nav";
import { Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
import { Bell, Menu } from "lucide-react";

// This component is currently not rendering the sidebar trigger correctly.
// We will replace it with a simpler header and create a bottom navigation for mobile.
export default function Header() {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-card px-4 md:px-6">
       <div className="flex items-center gap-2 md:hidden">
          <Link href="/dashboard" className="flex items-center gap-2 text-lg font-semibold">
            <Zap className="h-6 w-6 text-primary" />
            <span className="sr-only">MarketFlow</span>
          </Link>
        </div>

      <div className="flex w-full items-center justify-end gap-4">
        <Button variant="ghost" size="icon" className="rounded-full">
            <Bell className="h-5 w-5"/>
            <span className="sr-only">Toggle notifications</span>
        </Button>
        <UserNav />
      </div>
    </header>
  );
}
