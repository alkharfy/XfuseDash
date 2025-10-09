"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Client } from "@/lib/types";
import { formatShortDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, MoreHorizontal, Eye } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const statusVariantMap: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
    pending: "outline",
    in_progress: "default",
    under_review: "secondary",
    completed: "default",
    active: "secondary",
    approved: "default",
    bad_client: "destructive"
};

const statusTranslation: { [key: string]: string } = {
    pending: "معلق",
    in_progress: "قيد التنفيذ",
    under_review: "قيد المراجعة",
    completed: "مكتمل",
    active: "نشط",
    approved: "معتمد",
    bad_client: "عميل سيء",
    converted: "محول"
};

const ClientActions = ({ client }: { client: Client }) => {
    // In a real app, role would come from auth context
    const role = "moderator";

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">فتح القائمة</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>إجراءات</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                    <Link href={`/clients/${client.id}`}>
                        <Eye className="ms-2 h-4 w-4" />
                        عرض التفاصيل
                    </Link>
                </DropdownMenuItem>
                {/* Role-based actions would go here */}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};


export const columns: ColumnDef<Client>[] = [
    {
        accessorKey: "name",
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    الاسم
                    <ArrowUpDown className="mr-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => <div className="font-medium">{row.original.name}</div>
    },
    {
        accessorKey: "phone",
        header: "الهاتف",
    },
    {
        accessorKey: "basicInfo.email",
        header: "البريد الإلكتروني",
    },
    {
        accessorKey: "prStatus",
        header: "حالة PR",
        cell: ({ row }) => {
            const status = row.original.prStatus || 'pending';
            return <Badge variant={statusVariantMap[status] || 'secondary'}>{statusTranslation[status]}</Badge>
        }
    },
    {
        accessorKey: "transferStatus",
        header: "حالة التحويل",
        cell: ({ row }) => {
            const status = row.original.transferStatus || 'active';
            return <Badge variant={statusVariantMap[status] || 'secondary'}>{statusTranslation[status]}</Badge>
        }
    },
    {
        accessorKey: "registeredAt",
        header: "تاريخ التسجيل",
        cell: ({ row }) => formatShortDate(row.original.registeredAt)
    },
    {
        id: "actions",
        cell: ({ row }) => <ClientActions client={row.original} />,
    },
];
