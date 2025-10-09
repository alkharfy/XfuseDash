import { Client } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ClientHeaderProps {
    client: Client;
}

const statusVariantMap: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
    pending: "outline",
    in_progress: "default",
    under_review: "secondary",
    completed: "default",
    active: "secondary",
    approved: "default",
    bad_client: "destructive",
    converted: "default",
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

export function ClientHeader({ client }: ClientHeaderProps) {
    const prStatus = client.prStatus || 'pending';
    const transferStatus = client.transferStatus || 'active';

    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <h1 className="text-3xl font-bold font-headline">{client.name}</h1>
                <div className="flex gap-2">
                    <Badge variant={statusVariantMap[prStatus] || 'secondary'}>{statusTranslation[prStatus]}</Badge>
                    <Badge variant={statusVariantMap[transferStatus] || 'secondary'}>{statusTranslation[transferStatus]}</Badge>
                </div>
            </div>
            <div>
                <Button variant="ghost" size="icon">
                    <MoreVertical className="h-5 w-5" />
                </Button>
            </div>
        </div>
    )
}
