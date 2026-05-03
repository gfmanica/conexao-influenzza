import { useRef, useState, type ChangeEvent } from 'react';

export function usePhotoUpload({ onUrlChange }: { onUrlChange: (url: string) => void }) {
    const [photoPreview, setPhotoPreview] = useState('');
    const photoFileRef = useRef<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const initialPhotoUrlRef = useRef('');

    /**
     * Ao selecionar a foto, salva o arquivo e a prévia.
     */
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (!file) return;

        photoFileRef.current = file;

        setPhotoPreview(URL.createObjectURL(file));
    };

    /**
     * Deleta a foto.
     */
    const handleDelete = () => {
        photoFileRef.current = null;

        setPhotoPreview('');

        onUrlChange('');

        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    /**
     * Restaura a foto original.
     */
    const handleRestore = () => {
        photoFileRef.current = null;

        setPhotoPreview('');

        onUrlChange(initialPhotoUrlRef.current);

        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    /**
     * Reseta o estado inicial do photo upload.
     */
    const resetInitialUrl = (newInitialUrl = '') => {
        initialPhotoUrlRef.current = newInitialUrl;

        photoFileRef.current = null;

        setPhotoPreview(newInitialUrl);

        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return {
        photoPreview,
        photoFileRef,
        fileInputRef,
        handleFileChange,
        handleDelete,
        handleRestore,
        resetInitialUrl
    };
}
