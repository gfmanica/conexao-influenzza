import { CameraIcon, FileImageIcon, RotateCcwIcon, Trash2Icon, UserIcon } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

type PhotoUploadProps = {
    name: string;
    photoUrl: string;
    photoPreview: string;
    photoFileName: string;
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
    photoFileName,
    fileInputRef,
    inputId = 'photo',
    onFileChange,
    onDelete,
    onRestore,
    canRestore = false
}: PhotoUploadProps) {
    const currentPhoto = photoPreview || photoUrl;
    const hasPhoto = !!currentPhoto;

    const initials = name
        ?.split(' ')
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase();

    return (
        <>
            <input
                ref={fileInputRef}
                id={inputId}
                name="photo"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={onFileChange}
            />

            <div className="flex items-center gap-4 rounded-lg border bg-muted/30 p-4">
                <div className="relative shrink-0">
                    <Avatar className="size-16">
                        <AvatarImage src={currentPhoto || undefined} />
                        <AvatarFallback className="text-base">
                            {initials || <UserIcon className="size-5" />}
                        </AvatarFallback>
                    </Avatar>

                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-background hover:bg-muted border-border absolute -right-1 -bottom-1 flex size-7 items-center justify-center rounded-full border shadow-sm transition-colors"
                    >
                        <CameraIcon className="text-muted-foreground size-3.5" />
                    </button>
                </div>

                <div className="flex min-w-0 flex-col gap-2">
                    {photoFileName ? (
                        <div className="flex items-center gap-1.5 text-xs">
                            <FileImageIcon className="text-muted-foreground size-3.5 shrink-0" />
                            <span className="text-foreground max-w-[160px] truncate font-medium">
                                {photoFileName}
                            </span>
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-xs">
                            {hasPhoto ? 'Clique na câmera para alterar' : 'Nenhuma foto selecionada'}
                        </p>
                    )}

                    {(hasPhoto || canRestore) && (
                        <div className="flex flex-wrap gap-1.5">
                            {hasPhoto && (
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="xs"
                                    onClick={onDelete}
                                >
                                    <Trash2Icon data-icon="inline-start" />
                                    Excluir
                                </Button>
                            )}

                            {canRestore && onRestore && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="xs"
                                    onClick={onRestore}
                                >
                                    <RotateCcwIcon data-icon="inline-start" />
                                    Restaurar
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
