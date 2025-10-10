"use client";

import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import type { User, UserRole } from "@/lib/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormControl } from "@/components/ui/form";
import { Loader2 } from "lucide-react";

interface UserSelectorProps {
    selectedUser?: string;
    onSelectUser: (userId: string) => void;
    roles: UserRole[];
    placeholder?: string;
}

export function UserSelector({ selectedUser, onSelectUser, roles, placeholder = "اختر مستخدم..." }: UserSelectorProps) {
    const firestore = useFirestore();

    const usersQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, "users"), where("role", "in", roles));
    }, [firestore, roles]);

    const { data: users, isLoading } = useCollection<User>(usersQuery);

    if (isLoading) {
        return <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> جاري تحميل المستخدمين...</div>;
    }

    return (
        <Select onValueChange={onSelectUser} defaultValue={selectedUser}>
            <FormControl>
                <SelectTrigger>
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
            </FormControl>
            <SelectContent>
                {users?.map(user => (
                    <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
