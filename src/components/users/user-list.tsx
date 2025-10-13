"use client"

import * as React from "react"
import { User } from "@/lib/types"
import { DataTable } from "./data-table"
import { columns } from "./columns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { PlusCircle, Search } from "lucide-react"
import { AddUserDialog } from "./add-user-dialog"

export function UserList({ users }: { users: User[] }) {
  const [searchTerm, setSearchTerm] = React.useState("")

  const filteredUsers = users.filter(user => {
    const term = searchTerm.toLowerCase();
    const nameMatch = user.name ? user.name.toLowerCase().includes(term) : false;
    const emailMatch = user.email ? user.email.toLowerCase().includes(term) : false;
    return nameMatch || emailMatch;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>قائمة المستخدمين</CardTitle>
        <div className="flex flex-col sm:flex-row items-center gap-2 mt-4">
          <div className="relative w-full sm:flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ابحث بالاسم أو البريد الإلكتروني..."
              className="pr-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <AddUserDialog>
              <Button className="w-full sm:w-auto">
                  <PlusCircle className="ms-2 h-4 w-4" />
                  إضافة مستخدم
              </Button>
          </AddUserDialog>
        </div>
      </CardHeader>
      <CardContent>
        <DataTable columns={columns} data={filteredUsers} />
      </CardContent>
    </Card>
  )
}
