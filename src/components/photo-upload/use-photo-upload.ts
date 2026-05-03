import { useRef, useState } from 'react';

type UsePhotoUploadOptions = {
    onUrlChange: (url: string) => void;
};

export function usePhotoUpload({ onUrlChange }: UsePhotoUploadOptions) {
    const [photoPreview, setPhotoPreview] = useState('');
    const [photoFileName, setPhotoFileName] = useState('');
    const photoFileRef = useRef<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const initialPhotoUrlRef = useRef('');

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        photoFileRef.current = file;
        setPhotoPreview(URL.createObjectURL(file));
        setPhotoFileName(file.name);
    }

    function handleDelete() {
        photoFileRef.current = null;
        setPhotoPreview('');
        setPhotoFileName('');
        onUrlChange('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    }

    function handleRestore() {
        photoFileRef.current = null;
        setPhotoPreview('');
        setPhotoFileName('');
        onUrlChange(initialPhotoUrlRef.current);
        if (fileInputRef.current) fileInputRef.current.value = '';
    }

    function reset(newInitialUrl = '') {
        initialPhotoUrlRef.current = newInitialUrl;
        photoFileRef.current = null;
        setPhotoPreview('');
        setPhotoFileName('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    }

    return {
        photoPreview,
        photoFileName,
        photoFileRef,
        fileInputRef,
        handleFileChange,
        handleDelete,
        handleRestore,
        reset
    };
}
