import { useState } from 'react';

import { Link } from '@tanstack/react-router';
import { useForm } from '@tanstack/react-form';

import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { authClient } from '@/lib/auth/client';
import { cn } from '@/lib/utils';

function MagicLinkSent({ email, onBack }: { email: string; onBack: () => void }) {
    return (
        <div className="flex flex-col items-center gap-4 text-center">
            <h1 className="font-heading text-3xl tracking-tight">Verifique seu e-mail</h1>

            <p className="text-muted-foreground max-w-sm text-sm text-balance">
                Enviamos um link de acesso para <br />
                <strong className="text-foreground">{email}</strong>
            </p>

            <p className="text-muted-foreground text-xs">O link expira em 15 minutos.</p>

            <Button
                type="button"
                variant="ghost"
                onClick={onBack}
                className="transition-transform duration-160 ease-out active:scale-[0.97]"
            >
                Usar outro e-mail
            </Button>
        </div>
    );
}

export function LoginForm({ className }: React.ComponentProps<'form'>) {
    const [sentEmail, setSentEmail] = useState<string | null>(null);
    const [animKey, setAnimKey] = useState(0);

    const form = useForm({
        defaultValues: { email: '' },
        onSubmit: async ({ value, formApi }) => {
            const { error } = await authClient.signIn.magicLink({
                email: value.email,
                callbackURL: '/dashboard'
            });

            if (error) {
                formApi.setErrorMap({
                    onSubmit: {
                        fields: {
                            email: error.message ?? 'Erro ao enviar link.'
                        }
                    }
                });
                return;
            }

            setSentEmail(value.email);
            setAnimKey((k) => k + 1);
        }
    });

    function handleBack() {
        setSentEmail(null);
        setAnimKey((k) => k + 1);
    }

    return (
        <div
            key={animKey}
            className="animate-in fade-in-0 slide-in-from-bottom-3 duration-300"
        >
            {sentEmail ? (
                <MagicLinkSent email={sentEmail} onBack={handleBack} />
            ) : (
                <form
                    className={cn('flex flex-col gap-6', className)}
                    onSubmit={(e) => {
                        e.preventDefault();
                        form.handleSubmit();
                    }}
                >
                    <FieldGroup>
                        <div className="mb-2 flex flex-col items-center gap-2 text-center">
                            <h1 className="font-heading text-4xl tracking-tight">
                                Seja bem vindo!
                            </h1>

                            <p className="text-muted-foreground max-w-sm text-sm text-balance">
                                Informe seu e-mail para acessar sua conta.
                            </p>
                        </div>

                        <form.Field
                            name="email"
                            validators={{
                                onBlur: ({ value }) => {
                                    if (!value) return 'E-mail é obrigatório';
                                    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
                                        return 'E-mail inválido';
                                    return undefined;
                                }
                            }}
                        >
                            {(field) => {
                                const validationError =
                                    field.state.meta.isTouched &&
                                    field.state.meta.errors.length > 0;
                                const serverError = field.state.meta.errorMap?.onServer;
                                const isInvalid = validationError || !!serverError;

                                return (
                                    <Field data-invalid={isInvalid}>
                                        <FieldLabel htmlFor={field.name}>Email</FieldLabel>

                                        <Input
                                            id={field.name}
                                            name={field.name}
                                            onBlur={field.handleBlur}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            aria-invalid={isInvalid}
                                            type="email"
                                            placeholder="meuemail@email.com"
                                            required
                                        />

                                        {validationError && (
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

                        <Field>
                            <form.Subscribe selector={(s) => s.isSubmitting}>
                                {(isSubmitting) => (
                                    <Button
                                        type="submit"
                                        loading={isSubmitting}
                                        className="transition-transform duration-160 ease-out active:scale-[0.97]"
                                    >
                                        Enviar link de acesso
                                    </Button>
                                )}
                            </form.Subscribe>
                        </Field>
                    </FieldGroup>

                    <p className="text-muted-foreground text-center text-sm">
                        Não possui cadastro?{' '}
                        <Link
                            to="/register"
                            className="text-foreground underline underline-offset-4"
                        >
                            Cadastre-se
                        </Link>
                    </p>
                </form>
            )}
        </div>
    );
}
