import { Resend } from 'resend';

/**
 * Envia um e-mail com um link de acesso para o usuário.
 */
export async function sendMagicLinkEmail(to: string, url: string) {
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
        from: process.env.EMAIL_FROM as string,
        to,
        subject: 'Seu link de acesso — Conexão Influenzza',
        html: `
            <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;">
                <h2 style="margin:0 0 16px;">Acesse sua conta</h2>
                <p style="color:#555;margin:0 0 24px;">
                    Clique no botão abaixo para entrar na plataforma Conexão Influenzza.
                </p>
                <a href="${url}"
                   style="display:inline-block;padding:12px 24px;background:#000;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;font-size:15px;">
                    Entrar na plataforma
                </a>
                <p style="color:#999;font-size:13px;margin-top:32px;border-top:1px solid #eee;padding-top:16px;">
                    Este link expira em 15 minutos.<br>
                    Se você não solicitou acesso, ignore este e-mail.
                </p>
            </div>
        `
    });
}
