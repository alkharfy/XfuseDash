
"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { User, UserRole } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, MoreHorizontal, Edit, BookOpen, DollarSign, CalendarCheck, CalendarX } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useFirestore, useMemoFirebase, updateDocumentNonBlocking } from "@/firebase"
import { doc } from "firebase/firestore"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"

const roleTranslations: Record<UserRole, string> = {
    admin: 'مدير',
    moderator: 'مشرف',
    pr: 'علاقات عامة',
    market_researcher: 'باحث سوق',
    creative: 'مبدع',
    content: 'محتوى'
};

const userUpdateSchema = z.object({
  salary: z.coerce.number().min(0, "الراتب يجب أن يكون رقمًا موجبًا").optional(),
  attendanceDays: z.coerce.number().int().min(0, "يجب أن يكون عددًا صحيحًا موجبًا").optional(),
  absenceDays: z.coerce.number().int().min(0, "يجب أن يكون عددًا صحيحًا موجبًا").optional(),
  courses: z.array(z.object({ value: z.string().min(1, "لا يمكن أن يكون اسم الدورة فارغًا") })).optional(),
  role: z.enum(['admin', 'moderator', 'pr', 'market_researcher', 'creative', 'content']),
});

const getInitials = (name: string | null | undefined) => {
    if (!name) return "";
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[1][0]}`;
    }
    return name.substring(0, 2);
}

const UserActions = ({ user }: { user: User }) => {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);

    const form = useForm<z.infer<typeof userUpdateSchema>>({
        resolver: zodResolver(userUpdateSchema),
        defaultValues: {
            salary: user.salary || 0,
            attendanceDays: user.attendanceDays || 0,
            absenceDays: user.absenceDays || 0,
            courses: user.courses?.map(c => ({ value: c })) || [{ value: "" }],
            role: user.role,
        },
    });
    
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "courses"
    });

    const onSubmit = (values: z.infer<typeof userUpdateSchema>) => {
        if (!firestore) return;
        const userDocRef = doc(firestore, 'users', user.id);
        
        const dataToUpdate = {
            ...values,
            courses: values.courses?.map(c => c.value).filter(Boolean) || []
        };
        
        updateDocumentNonBlocking(userDocRef, dataToUpdate);

        toast({
            title: "تم الحفظ",
            description: `تم تحديث بيانات ${user.name} بنجاح.`,
        });
        setIsDialogOpen(false);
    };

    return (
         <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">فتح القائمة</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>إجراءات</DropdownMenuLabel>
                    <DialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Edit className="ms-2 h-4 w-4" />
                            تعديل المستخدم
                        </DropdownMenuItem>
                    </DialogTrigger>
                </DropdownMenuContent>
            </DropdownMenu>

            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>تعديل بيانات: {user.name}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto p-2">
                        <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>الدور</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {Object.entries(roleTranslations).map(([key, value]) => (
                                                <SelectItem key={key} value={key}>{value}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="salary"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex items-center gap-2"><DollarSign className="w-4 h-4 text-muted-foreground"/>الراتب</FormLabel>
                                <FormControl><Input type="number" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                         <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="attendanceDays"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2"><CalendarCheck className="w-4 h-4 text-muted-foreground"/>أيام الحضور</FormLabel>
                                    <FormControl><Input type="number" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="absenceDays"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2"><CalendarX className="w-4 h-4 text-muted-foreground"/>أيام الغياب</FormLabel>
                                    <FormControl><Input type="number" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        </div>
                        <div>
                            <FormLabel className="flex items-center gap-2 mb-2"><BookOpen className="w-4 h-4 text-muted-foreground"/>الدورات التدريبية</FormLabel>
                            {fields.map((field, index) => (
                                <FormField
                                    key={field.id}
                                    control={form.control}
                                    name={`courses.${index}.value`}
                                    render={({ field }) => (
                                        <FormItem className="flex items-center gap-2 mb-2">
                                            <FormControl><Input {...field} placeholder={`دورة #${index + 1}`} /></FormControl>
                                            <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}>إزالة</Button>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            ))}
                             <Button type="button" variant="outline" size="sm" onClick={() => append({ value: "" })}>
                                إضافة دورة
                            </Button>
                        </div>

                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="ghost">إلغاء</Button>
                            </DialogClose>
                            <Button type="submit">حفظ التغييرات</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};


export const columns: ColumnDef<User>[] = [
    {
        accessorKey: "name",
        header: ({ column }) => (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                المستخدم
                <ArrowUpDown className="mr-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => (
            <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                    <AvatarImage src={row.original.avatarUrl} alt={row.original.name} />
                    <AvatarFallback>{getInitials(row.original.name)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                    <span className="font-medium">{row.original.name}</span>
                    <span className="text-xs text-muted-foreground">{row.original.email}</span>
                </div>
            </div>
        )
    },
    {
        accessorKey: "role",
        header: "الدور",
        cell: ({ row }) => <span>{roleTranslations[row.original.role]}</span>
    },
    {
        accessorKey: "salary",
        header: "الراتب",
        cell: ({ row }) => <span>{row.original.salary ? `${row.original.salary} ريال` : "غير محدد"}</span>
    },
    {
        accessorKey: "active",
        header: "الحالة",
        cell: ({ row }) => (
            <span className={`px-2 py-1 text-xs rounded-full ${row.original.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                {row.original.active ? "نشط" : "غير نشط"}
            </span>
        )
    },
    {
        id: "actions",
        cell: ({ row }) => <UserActions user={row.original} />,
    },
];
