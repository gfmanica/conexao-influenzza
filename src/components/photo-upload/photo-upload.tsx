import { Camera, RotateCcw, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { PhotoAvatar } from './photo-avatar';

type PhotoUpload = {
    name: string;
    photoUrl: string;
    photoPreview: string;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    inputId?: string;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onDelete: () => void;
    onRestore?: () => void;
    canRestore?: boolean;
};

export function PhotoUpload({
    name,
    photoUrl,
    photoPreview,
    fileInputRef,
    inputId = 'photo',
    onFileChange,
    onDelete,
    onRestore,
    canRestore = false
}: PhotoUpload) {
    const currentPhoto = photoPreview || photoUrl;
    const hasPhoto = !!currentPhoto;

    return (
        <>
            <input
                ref={fileInputRef}
                id={inputId}
                name="photo"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onFileChange}
            />

            <div className="bg-muted/20 flex items-start gap-4 rounded-lg border border-dashed p-4">
                <div className="shrink-0">
                    <PhotoAvatar photoUrl={currentPhoto} name={name} className="size-22" />
                </div>

                <div className="flex w-45 flex-col items-stretch justify-start gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="xs"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Camera /> Selecionar imagem
                    </Button>

                    {hasPhoto && (
                        <Button type="button" variant="destructive" size="xs" onClick={onDelete}>
                            <Trash2 />
                            Excluir
                        </Button>
                    )}

                    {canRestore && onRestore && (
                        <Button type="button" variant="outline" size="xs" onClick={onRestore}>
                            <RotateCcw />
                            Restaurar
                        </Button>
                    )}
                </div>
            </div>
        </>
    );
}
