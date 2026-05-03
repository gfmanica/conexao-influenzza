import { useState } from 'react';

import { useForm } from '@tanstack/react-form';
import { Link } from '@tanstack/react-router';
import { CheckCircle2Icon } from 'lucide-react';

import { PhotoUpload } from '@/components/photo-upload/photo-upload';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePhotoUpload } from '@/hooks/use-photo-upload';
import { registerArchitect } from '@/routes/(app)/architects/-server';
import { registerArchitectSchema } from '@/routes/(app)/architects/-types';

async function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function RegisterSuccess({ name }: { name: string }) {
    return (
        <div className="animate-in fade-in-0 slide-in-from-bottom-3 flex flex-col items-center gap-5 text-center duration-300">
            <div className="bg-foreground/5 ring-foreground/10 flex size-16 items-center justify-center rounded-full ring-1">
                <CheckCircle2Icon className="text-foreground size-8" />
            </div>

            <div className="flex flex-col gap-2">
                <h1 className="font-heading text-3xl tracking-tight">Cadastro realizado!</h1>

                <p className="text-muted-foreground max-w-sm text-sm text-balance">
                    Olá, <strong className="text-foreground">{name}</strong>! Seu cadastro foi
                    concluído com sucesso. Agora acesse o portal pelo link de acesso enviado ao seu
                    e-mail.
                </p>
            </div>

            <Link to="/login">
                <Button variant="outline">Ir para o login</Button>
            </Link>
        </div>
    );
}

export function RegisterForm() {
    const [registeredName, setRegisteredName] = useState<string | null>(null);

    const photoUpload = usePhotoUpload({ onUrlChange: () => {} });

    const form = useForm({
        defaultValues: {
            name: '',
            email: '',
            officeEmail: '',
            phone: '',
            officeAddress: '',
            birthdate: '',
            cauRegister: ''
        },
        onSubmit: async ({ value, formApi }) => {
            try {
                let photoBase64: string | undefined;
                let photoFileName: string | undefined;
                let photoContentType: string | undefined;

                if (photoUpload.photoFileRef.current) {
                    const file = photoUpload.photoFileRef.current;
                    photoBase64 = await fileToBase64(file);
                    photoFileName = file.name;
                    photoContentType = file.type;
                }

                const result = await registerArchitect({
                    data: { ...value, photoBase64, photoFileName, photoContentType }
                });
                setRegisteredName(result.name);
            } catch (e: unknown) {
                console.log(e);
                // formApi.setErrorMap({
                //     onSubmit: e instanceof Error ? e.message : 'Erro ao realizar cadastro.'
                // });
            }
        },
        validators: {
            onSubmit: ({ value }) => {
                const result = registerArchitectSchema.safeParse(value);
                if (!result.success) {
                    return result.error.issues[0]?.message ?? 'Formulário inválido';
                }
                return undefined;
            }
        }
    });

    if (registeredName) {
        return <RegisterSuccess name={registeredName} />;
    }

    return (
        <div className="animate-in fade-in-0 slide-in-from-bottom-3 duration-300">
            <form
                className="flex flex-col gap-5"
                onSubmit={(e) => {
                    e.preventDefault();
                    form.handleSubmit();
                }}
            >
                <FieldGroup>
                    <div className="mb-2 flex flex-col items-center gap-2 text-center">
                        <h1 className="font-heading text-4xl tracking-tight">Criar conta</h1>

                        <p className="text-muted-foreground max-w-sm text-sm text-balance">
                            Preencha seus dados para se cadastrar como arquiteto parceiro.
                        </p>
                    </div>

                    {/* Foto de perfil */}
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="photo">Foto de perfil</Label>
                        <form.Subscribe selector={(s) => s.values.name}>
                            {(name) => (
                                <PhotoUpload
                                    inputId="photo"
                                    name={name}
                                    photoUrl=""
                                    photoPreview={photoUpload.photoPreview}
                                    fileInputRef={photoUpload.fileInputRef}
                                    onFileChange={photoUpload.handleFileChange}
                                    onDelete={photoUpload.handleDelete}
                                />
                            )}
                        </form.Subscribe>
                    </div>

                    {/* Nome */}
                    <form.Field name="name">
                        {(field) => {
                            const isInvalid =
                                field.state.meta.isTouched && field.state.meta.errors.length > 0;
                            return (
                                <Field data-invalid={isInvalid}>
                                    <FieldLabel htmlFor="name">
                                        Nome completo <span className="text-destructive">*</span>
                                    </FieldLabel>

                                    <Input
                                        id="name"
                                        placeholder="Ex: Ana Carolina Mendes"
                                        value={field.state.value}
                                        onBlur={field.handleBlur}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        aria-invalid={isInvalid}
                                    />

                                    {isInvalid && (
                                        <FieldError
                                            errors={field.state.meta.errors.map((e) => ({
                                                message: String(e)
                                            }))}
                                        />
                                    )}
                                </Field>
                            );
                        }}
                    </form.Field>

                    <form.Field name="email">
                        {(field) => {
                            const isInvalid =
                                field.state.meta.isTouched && field.state.meta.errors.length > 0;
                            return (
                                <Field data-invalid={isInvalid}>
                                    <FieldLabel htmlFor="email">
                                        E-mail <span className="text-destructive">*</span>
                                    </FieldLabel>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="arquiteto@escritorio.com"
                                        value={field.state.value}
                                        onBlur={field.handleBlur}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        aria-invalid={isInvalid}
                                    />
                                    {isInvalid && (
                                        <FieldError
                                            errors={field.state.meta.errors.map((e) => ({
                                                message: String(e)
                                            }))}
                                        />
                                    )}
                                </Field>
                            );
                        }}
                    </form.Field>

                    <form.Field name="officeEmail">
                        {(field) => {
                            const isInvalid =
                                field.state.meta.isTouched && field.state.meta.errors.length > 0;
                            return (
                                <Field data-invalid={isInvalid}>
                                    <FieldLabel htmlFor="officeEmail">
                                        E-mail do escritório
                                    </FieldLabel>
                                    <Input
                                        id="officeEmail"
                                        type="email"
                                        placeholder="contato@escritorio.com"
                                        value={field.state.value}
                                        onBlur={field.handleBlur}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        aria-invalid={isInvalid}
                                    />
                                    {isInvalid && (
                                        <FieldError
                                            errors={field.state.meta.errors.map((e) => ({
                                                message: String(e)
                                            }))}
                                        />
                                    )}
                                </Field>
                            );
                        }}
                    </form.Field>

                    <div className="grid grid-cols-2 gap-4">
                        <form.Field name="phone">
                            {(field) => (
                                <Field>
                                    <FieldLabel htmlFor="phone">Telefone</FieldLabel>

                                    <Input
                                        id="phone"
                                        placeholder="(11) 99999-0000"
                                        value={field.state.value}
                                        onBlur={field.handleBlur}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                    />
                                </Field>
                            )}
                        </form.Field>

                        <form.Field name="birthdate">
                            {(field) => (
                                <Field>
                                    <FieldLabel htmlFor="birthdate">Nascimento</FieldLabel>
                                    <Input
                                        id="birthdate"
                                        type="date"
                                        value={field.state.value}
                                        onBlur={field.handleBlur}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                    />
                                </Field>
                            )}
                        </form.Field>
                    </div>

                    <form.Field name="cauRegister">
                        {(field) => (
                            <Field>
                                <FieldLabel htmlFor="cauRegister">Registro CAU</FieldLabel>
                                <Input
                                    id="cauRegister"
                                    placeholder="Ex: A123456-0"
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                />
                            </Field>
                        )}
                    </form.Field>

                    {/* Endereço do escritório */}
                    <form.Field name="officeAddress">
                        {(field) => (
                            <Field>
                                <FieldLabel htmlFor="officeAddress">
                                    Endereço do escritório
                                </FieldLabel>
                                <Input
                                    id="officeAddress"
                                    placeholder="Rua das Flores, 123, São Paulo - SP"
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                />
                            </Field>
                        )}
                    </form.Field>

                    <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting]}>
                        {([canSubmit, isSubmitting]) => (
                            <Field>
                                <Button
                                    type="submit"
                                    disabled={!canSubmit}
                                    loading={isSubmitting as boolean}
                                    className="transition-transform duration-160 ease-out active:scale-[0.97]"
                                >
                                    Criar conta
                                </Button>
                            </Field>
                        )}
                    </form.Subscribe>
                </FieldGroup>

                <p className="text-muted-foreground text-center text-sm">
                    Já possui cadastro?{' '}
                    <Link to="/login" className="text-foreground underline underline-offset-4">
                        Fazer login
                    </Link>
                </p>
            </form>
        </div>
    );
}
