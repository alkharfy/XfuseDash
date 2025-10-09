import ClientList from "@/components/clients/client-list";

export default function ClientsPage() {
  return (
    <div className="flex flex-col gap-8">
       <div>
            <h1 className="text-3xl font-headline font-bold">إدارة العملاء</h1>
            <p className="text-muted-foreground">عرض، تحرير، وإدارة جميع عملائك من مكان واحد.</p>
        </div>
      <ClientList />
    </div>
  );
}
