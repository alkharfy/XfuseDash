
import { UserRole } from './types';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Lightbulb,
  FileText,
  BadgeCheck,
  UserX,
  Phone,
  FileClock,
  Bell,
  BarChart,
} from "lucide-react";

export const getTabsForRole = (role: UserRole) => {
    switch (role) {
        case 'moderator':
            return [
                { value: "my-clients", label: "عملائي" },
                { value: "all", label: "كل العملاء" },
            ];
        case 'pr':
            return [
                { value: "my-clients", label: "عملائي" },
                { value: "approved", label: "معتمدون" },
                { value: "bad-clients", label: "سيئون" },
                { value: "today-calls", label: "مكالمات اليوم" },
                { value: "not-started", label: "لم يبدأ" },
            ];
        default:
             return [{ value: "my-tasks", label: "مهامي" }];
    }
};

const moderatorLinks = [
  { href: "/dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
  { href: "/clients?tab=my-clients", label: "العملاء", icon: Users },
  { href: "/notifications", label: "الإشعارات", icon: Bell },
  { href: "/reports", label: "التقارير", icon: BarChart },
];

const prLinks = [
  { href: "/dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
  { href: "/clients?tab=my-clients", label: "عملائي", icon: Users },
  { href: "/clients?tab=approved", label: "العملاء المعتمدون", icon: BadgeCheck },
  { href: "/clients?tab=bad-clients", label: "عملاء سيئون", icon: UserX },
  { href: "/clients?tab=today-calls", label: "مكالمات اليوم", icon: Phone },
  { href: "/clients?tab=not-started", label: "لم يبدأ بعد", icon: FileClock },
];

const researcherLinks = [
    { href: "/dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
    { href: "/clients?tab=my-tasks", label: "مهام البحث", icon: Briefcase },
];

const creativeLinks = [
    { href: "/dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
    { href: "/clients?tab=my-tasks", label: "مهام الإبداع", icon: Lightbulb },
];

const contentLinks = [
    { href: "/dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
    { href: "/clients?tab=my-tasks", label: "مهام المحتوى", icon: FileText },
];

export const getLinksForRole = (role: UserRole | null) => {
    if (!role) return [];
    switch (role) {
        case 'moderator': return moderatorLinks;
        case 'pr': return prLinks;
        case 'market_researcher': return researcherLinks;
        case 'creative': return creativeLinks;
        case 'content': return contentLinks;
        default: return [];
    }
}
