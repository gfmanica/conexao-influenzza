import { useForm } from '@tanstack/react-form';

import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { requestOtp } from '@/server/auth';
import { useLoginStore } from '@/store/use-login-store';

export function LoginForm({ className }: React.ComponentProps<'form'>) {
    const setStep = useLoginStore((state) => state.setStep);
    const setEmail = useLoginStore((state) => state.setEmail);

    const form = useForm({
        defaultValues: { email: '' },
        onSubmit: async ({ value, formApi }) => {
            try {
                await requestOtp({ data: { email: value.email } });

                setEmail(value.email);

                setStep('otp');
            } catch (err) {
                formApi.setErrorMap({
                    onSubmit: {
                        fields: {
                            email: err instanceof Error ? err.message : 'Erro ao enviar código.'
                        }
                    }
                });
            }
        }
    });

    return (
        <form
            className={cn('flex flex-col gap-6', className)}
            onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit();
            }}
        >
            <FieldGroup>
                <div className="mb-2 flex flex-col items-center gap-2 text-center">
                    <h1 className="font-heading text-4xl tracking-tight">Seja bem vindo!</h1>

                    <p className="text-muted-foreground max-w-sm text-sm text-balance">
                        Informe seu e-mail para acessar sua conta.
                    </p>
                </div>

                <form.Field
                    name="email"
                    validators={{
                        onBlur: ({ value }) => {
                            if (!value) return 'E-mail é obrigatório';
                            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'E-mail inválido';
                            return undefined;
                        }
                    }}
                >
                    {(field) => {
                        const validationError =
                            field.state.meta.isTouched && field.state.meta.errors.length > 0;
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
                                Continuar
                            </Button>
                        )}
                    </form.Subscribe>
                </Field>
            </FieldGroup>
        </form>
    );
}
