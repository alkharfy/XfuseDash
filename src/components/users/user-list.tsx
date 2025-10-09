
"use client"

import * as React from "react"
import { User } from "@/lib/types"
import { DataTable } from "./data-table"
import { columns } from "./columns"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export function UserList({ users }: { users: User[] }) {
  const [searchTerm, setSearchTerm] = React.useState("")

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <div className="relative w-full max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ابحث بالاسم أو البريد الإلكتروني..."
            className="pr-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
        <DataTable columns={columns} data={filteredUsers} />
      </CardContent>
    </Card>
  )
}
