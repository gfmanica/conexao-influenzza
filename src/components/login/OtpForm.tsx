import { useForm } from '@tanstack/react-form';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { toast } from 'sonner';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel
} from '@/components/ui/field';
import { cn } from '@/lib/utils';
import { useLoginStore } from '@/store/useLoginStore';

import { InputOTP, InputOTPGroup, InputOTPSlot } from '../ui/input-otp';

const otpSchema = z.object({
    otp: z.string().length(6, 'Código inválido')
});

export function OtpForm({ className }: React.ComponentProps<'form'>) {
    const email = useLoginStore((state) => state.email);
    const setStep = useLoginStore((state) => state.setStep);

    const form = useForm({
        defaultValues: {
            otp: ''
        },
        validators: {
            onSubmit: otpSchema
        },
        onSubmit: async ({ value }) => {
            toast.success(`Validando OTP ${value.otp} para ${email}`);
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
                <div className="flex flex-col items-center gap-1 text-center">
                    <h1 className="text-2xl font-bold">
                        Código de verificação
                    </h1>
                    <p className="text-muted-foreground text-sm text-balance">
                        Digite o código de 6 dígitos enviado para <br />
                        <strong className="text-foreground">
                            {email}
                        </strong>{' '}
                        para continuar
                    </p>
                </div>

                <form.Field
                    name="otp"
                    children={(field) => {
                        const isInvalid =
                            field.state.meta.isTouched &&
                            !field.state.meta.isValid;

                        return (
                            <Field data-invalid={isInvalid}>
                                <FieldLabel htmlFor={field.name}>
                                    Código
                                </FieldLabel>

                                <InputOTP
                                    maxLength={6}
                                    pattern={REGEXP_ONLY_DIGITS}
                                    data-invalid={isInvalid}
                                    value={field.state.value}
                                    onChange={(value) =>
                                        field.handleChange(value)
                                    }
                                    onBlur={field.handleBlur}
                                >
                                    <InputOTPGroup className="w-full [&>div]:flex-1">
                                        <InputOTPSlot index={0} />
                                        <InputOTPSlot index={1} />
                                        <InputOTPSlot index={2} />
                                        <InputOTPSlot index={3} />
                                        <InputOTPSlot index={4} />
                                        <InputOTPSlot index={5} />
                                    </InputOTPGroup>
                                </InputOTP>

                                {isInvalid && (
                                    <FieldError
                                        errors={field.state.meta.errors}
                                    />
                                )}
                            </Field>
                        );
                    }}
                ></form.Field>

                <div className="flex flex-col gap-3">
                    <Field>
                        <Button
                            type="submit"
                            className="transition-transform duration-160 ease-out active:scale-[0.97]"
                        >
                            Validar código
                        </Button>
                    </Field>

                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setStep('email')}
                        className="transition-transform duration-160 ease-out active:scale-[0.97]"
                    >
                        Alterar email
                    </Button>
                </div>
            </FieldGroup>
        </form>
    );
}
