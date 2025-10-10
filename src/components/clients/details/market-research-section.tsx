"use client";

import { ChangeEvent, useState, useTransition } from "react";
import { Client, MarketResearchFileCategory } from "@/lib/types";
import { getSummaryForResearchFile } from "@/app/actions";
import { useAuthStore } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { File, Loader2, Sparkles, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { updateDocumentNonBlocking, useFirestore, useFirebaseApp } from "@/firebase";
import { arrayUnion, doc } from "firebase/firestore";
import { getStorage, ref, uploadBytesResumable, getDownloadURL, UploadTask } from 'firebase/storage';

const categoryTranslations: Record<MarketResearchFileCategory, string> = {
    creative: "كريتيف",
    copywriter: "كوبي رايتر",
    media_buyer: "ميديا باير",
    manager: "مدير",
    client: "عميل",
};

const FileUploadArea = ({
  category,
  label,
  clientId,
}: {
  category: MarketResearchFileCategory;
  label: string;
  clientId: string;
}) => {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const firebaseApp = useFirebaseApp();
  const firestore = useFirestore();
  const storage = getStorage(firebaseApp);

  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!user) {
        toast({ variant: "destructive", title: "خطأ", description: "يجب أن تكون مسجلاً للدخول لرفع الملفات." });
        return;
      }
      
      const filePath = `${clientId}/${file.name}`;
      const storageRef = ref(storage, filePath);
      const uploadTask: UploadTask = uploadBytesResumable(storageRef, file);

      setIsUploading(true);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const currentProgress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(currentProgress);
        },
        (error) => {
          console.error("Upload failed:", error);
          setIsUploading(false);
          toast({ variant: "destructive", title: "خطأ في الرفع", description: error.message });
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            
            const clientRef = doc(firestore, "clients", clientId);
            const newFile: any = {
                fileName: file.name,
                fileUrl: downloadURL,
                uploadedAt: new Date(),
                uploadedBy: user.uid,
                category: category,
            };

            await updateDocumentNonBlocking(clientRef, {
                marketResearchFiles: arrayUnion(newFile)
            });

            toast({ title: "نجاح", description: `تم رفع الملف "${file.name}" بنجاح.` });
            setIsUploading(false);
          } catch (e) {
            console.error("Could not get download URL or update document:", e);
            toast({ variant: "destructive", title: "خطأ بعد الرفع", description: (e as Error).message });
            setIsUploading(false);
          }
        }
      );
    }
  };
    
  const inputId = `file-upload-${category}`;

  return (
    <div className="p-4 border-2 border-dashed rounded-lg text-center space-y-2 relative">
      {isUploading ? (
        <>
          <Loader2 className="mx-auto h-8 w-8 text-muted-foreground animate-spin" />
          <h4 className="font-semibold">جاري رفع ملف لـ {label}...</h4>
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-muted-foreground">{Math.round(progress)}%</p>
        </>
      ) : (
        <>
          <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
          <h4 className="font-semibold">ملف موجه لـ {label}</h4>
          <Input type="file" className="hidden" id={inputId} onChange={handleFileChange} />
          <Button asChild variant="outline" size="sm">
            <label htmlFor={inputId}>تصفح الملفات</label>
          </Button>
        </>
      )}
    </div>
  );
};


export function MarketResearchSection({ client }: { client: Client }) {
    const { role } = useAuthStore();
    const [summary, setSummary] = useState(client.marketResearchSummary || "");
    const [isSummarizing, startSummarizeTransition] = useTransition();
    const { toast } = useToast();

    const handleSummarize = (fileName: string) => {
        startSummarizeTransition(async () => {
            const result = await getSummaryForResearchFile(fileName, client.id);
            if (result.summary) {
                setSummary(result.summary);
                toast({ title: "نجاح", description: "تم تلخيص الملف بنجاح." });
            } else {
                toast({ variant: "destructive", title: "خطأ", description: result.error });
            }
        });
    }

    const fileCategories: MarketResearchFileCategory[] = ["creative", "copywriter", "media_buyer", "manager", "client"];

    return (
        <Card>
            <CardHeader>
                <CardTitle>قسم أبحاث السوق</CardTitle>
                <CardDescription>رفع ملفات البحث وتوليد ملخصات تلقائية.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {(role === 'market_researcher' || role === 'moderator') && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {fileCategories.map(category => (
                            <FileUploadArea 
                                key={category}
                                category={category} 
                                label={categoryTranslations[category]}
                                clientId={client.id}
                            />
                        ))}
                    </div>
                )}

                <div>
                    <h4 className="font-semibold mb-2">الملفات المرفوعة</h4>
                    <div className="space-y-2">
                        {client.marketResearchFiles?.length ? client.marketResearchFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-2 rounded-md border">
                                <div className="flex items-center gap-2">
                                    <File className="h-4 w-4 text-muted-foreground" />
                                    <span>{file.fileName}</span>
                                    {file.category && <span className="text-xs text-muted-foreground">({categoryTranslations[file.category] || file.category})</span>}
                                </div>
                                {(role === 'market_researcher' || role === 'moderator' || role === 'creative') && (
                                    <Button size="sm" onClick={() => handleSummarize(file.fileName)} disabled={isSummarizing}>
                                        {isSummarizing ? <Loader2 className="ms-2 h-4 w-4 animate-spin"/> : <Sparkles className="ms-2 h-4 w-4"/>}
                                        تلخيص
                                    </Button>
                                )}
                            </div>
                        )) : <p className="text-sm text-muted-foreground">لا توجد ملفات مرفوعة.</p>}
                    </div>
                </div>

                {summary && (
                    <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary"/> ملخص البحث</h4>
                        <p className="text-sm bg-primary/5 p-4 rounded-md border border-primary/20 leading-relaxed">{summary}</p>
                    </div>
                )}

                 {isSummarizing && (
                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">جاري تحليل الملف وتوليد الملخص...</p>
                        <Progress value={50} className="w-full" />
                    </div>
                 )}
            </CardContent>
        </Card>
    );
}
