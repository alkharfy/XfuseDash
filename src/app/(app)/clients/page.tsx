
import ClientList from "@/components/clients/client-list";
import { AddClientDialog } from "@/components/clients/add-client-dialog";
import { useAuthStore } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function ClientsPage() {
  const { role } = useAuthStore.getState(); // Use getState for non-reactive access outside of components

  return (
    <div className="flex flex-col gap-8">
       <div className="flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-headline font-bold">إدارة العملاء</h1>
                <p className="text-muted-foreground">عرض، تحرير، وإدارة جميع عملائك من مكان واحد.</p>
            </div>
            {(role === 'admin' || role === 'moderator') && (
              <AddClientDialog>
                <Button>
                  <PlusCircle className="ms-2 h-4 w-4" />
                  إضافة عميل
                </Button>
              </AddClientDialog>
            )}
        </div>
      <ClientList />
    </div>
  );
}
