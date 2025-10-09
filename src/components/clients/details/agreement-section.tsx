import { Client } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatShortDate } from "@/lib/utils";
import { mockUsers } from "@/lib/data";

export function AgreementSection({ client }: { client: Client }) {
    if (!client.finalAgreement) return null;

    const { agreementDetails, duration, startDate, approvedBy, approvedAt } = client.finalAgreement;
    
    const approverName = mockUsers.find(u => u.uid === approvedBy)?.name || "غير معروف";

    return (
        <Card>
            <CardHeader>
                <CardTitle>الاتفاقية النهائية</CardTitle>
                <CardDescription>تفاصيل الاتفاقية المعتمدة مع العميل.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
                <p><strong>التفاصيل:</strong> {agreementDetails}</p>
                <p><strong>مدة العقد:</strong> {duration} أشهر</p>
                <p><strong>تاريخ البدء:</strong> {formatShortDate(startDate)}</p>
                <p><strong>تمت الموافقة بواسطة:</strong> {approverName}</p>
                <p><strong>تاريخ الموافقة:</strong> {formatShortDate(approvedAt)}</p>
            </CardContent>
        </Card>
    );
}
