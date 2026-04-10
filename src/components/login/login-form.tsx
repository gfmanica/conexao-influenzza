import { useForm } from '@tanstack/react-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useLoginStore } from '@/store/use-login-store';

const loginSchema = z.object({
    email: z.string().email('Email inválido')
});

export function LoginForm({ className }: React.ComponentProps<'form'>) {
    const setStep = useLoginStore((state) => state.setStep);
    const setEmail = useLoginStore((state) => state.setEmail);

    const form = useForm({
        defaultValues: {
            email: ''
        },
        validators: {
            onSubmit: loginSchema
        },
        onSubmit: async ({ value }) => {
            setEmail(value.email);
            setStep('otp');
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
                    <h1 className="font-heading text-4xl tracking-tight">
                        Seja bem vindo!
                    </h1>

                    <p className="text-muted-foreground max-w-sm text-sm text-balance">
                        Informe seu e-mail para acessar sua conta.
                    </p>
                </div>

                <form.Field
                    name="email"
                    children={(field) => {
                        const isInvalid =
                            field.state.meta.isTouched &&
                            !field.state.meta.isValid;

                        return (
                            <Field data-invalid={isInvalid}>
                                <FieldLabel htmlFor={field.name}>
                                    Email
                                </FieldLabel>

                                <Input
                                    id={field.name}
                                    name={field.name}
                                    onBlur={field.handleBlur}
                                    onChange={(e) =>
                                        field.handleChange(e.target.value)
                                    }
                                    aria-invalid={isInvalid}
                                    type="email"
                                    placeholder="meuemail@email.com"
                                    required
                                />

                                {isInvalid && (
                                    <FieldError
                                        errors={field.state.meta.errors}
                                    />
                                )}
                            </Field>
                        );
                    }}
                />

                <Field>
                    <Button
                        type="submit"
                        className="transition-transform duration-160 ease-out active:scale-[0.97]"
                    >
                        Continuar
                    </Button>
                </Field>
            </FieldGroup>
        </form>
    );
}
