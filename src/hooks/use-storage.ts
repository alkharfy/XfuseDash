"use client";

import { useState } from 'react';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, UploadTask } from 'firebase/storage';
import { useFirebaseApp } from '@/firebase';

export function useUploadFile() {
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const firebaseApp = useFirebaseApp();
  const storage = getStorage(firebaseApp);

  const uploadFile = (filePath: string, file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const storageRef = ref(storage, filePath);
      const uploadTask: UploadTask = uploadBytesResumable(storageRef, file);

      setIsUploading(true);
      setError(null);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(progress);
        },
        (error) => {
          console.error("Upload failed:", error);
          setError(error);
          setIsUploading(false);
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            setIsUploading(false);
            setProgress(100);
            resolve(downloadURL);
          } catch (e) {
             console.error("Could not get download URL:", e);
             setError(e as Error);
             setIsUploading(false);
             reject(e);
          }
        }
      );
    });
  };

  return { uploadFile, progress, isUploading, error };
}
