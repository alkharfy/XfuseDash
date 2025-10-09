"use client";

import { useParams } from "next/navigation";
import { ClientHeader } from "@/components/clients/details/client-header";
import { PRSection } from "@/components/clients/details/pr-section";
import { MarketResearchSection } from "@/components/clients/details/market-research-section";
import { CreativeSection } from "@/components/clients/details/creative-section";
import { ContentSection } from "@/components/clients/details/content-section";
import { AgreementSection } from "@/components/clients/details/agreement-section";
import { useAuthStore } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import type { Client } from "@/lib/types";
import { Loader2 } from "lucide-react";

export default function ClientDetailPage() {
    const params = useParams();
    const { id } = params;
    const { role } = useAuthStore();
    const firestore = useFirestore();

    const clientRef = useMemoFirebase(() => {
        if (!firestore || !id) return null;
        return doc(firestore, 'clients', id as string);
    }, [firestore, id]);

    const { data: client, isLoading } = useDoc<Client>(clientRef);

    if (isLoading) {
        return (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        );
    }
    
    if (!client) {
        return <div className="text-center p-8">لم يتم العثور على العميل.</div>
    }

    return (
        <div className="space-y-6">
            <ClientHeader client={client} />

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    {/* PR Section */}
                    {(role === 'pr' || role === 'moderator') && <PRSection client={client} />}

                    {/* Market Research Section */}
                    {client.serviceRequests?.marketResearch && (role === 'market_researcher' || role === 'moderator' || role === 'creative' || role === 'content') && <MarketResearchSection client={client} />}
                    
                    {/* Creative Section */}
                    {client.serviceRequests?.creative && (role === 'creative' || role === 'moderator' || role === 'content') && <CreativeSection client={client} />}

                    {/* Content Section */}
                    {client.serviceRequests?.content && client.creativeStatus === 'completed' && (role === 'content' || role === 'moderator') && <ContentSection client={client} />}
                </div>

                <div className="space-y-6 lg:col-span-1">
                    {client.basicInfo && (
                        <Card>
                            <CardHeader>
                                <CardTitle>المعلومات الأساسية</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <p><strong>الهاتف:</strong> {client.phone}</p>
                                <p><strong>الإيميل:</strong> {client.basicInfo.email}</p>
                                <p><strong>العنوان:</strong> {client.basicInfo.address}</p>
                                <p><strong>ملاحظات:</strong> {client.basicInfo.notes}</p>
                            </CardContent>
                        </Card>
                    )}

                    {client.finalAgreement && <AgreementSection client={client} />}
                </div>
            </div>
        </div>
    );
}
