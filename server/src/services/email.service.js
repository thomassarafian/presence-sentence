import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send email verification email using Resend
 */
export const sendVerificationEmail = async (email, pseudo, token) => {
  const verificationUrl = `${process.env.APP_URL || 'http://localhost:5173'}/verify-email/${token}`;

  // Use your verified domain or Resend's test address
  const fromAddress = process.env.EMAIL_FROM || 'onboarding@resend.dev';

  try {
    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: email,
      subject: 'Vérifiez votre email - Citation Présence',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Bonjour ${pseudo} !</h2>
          <p>Merci de vous être inscrit sur Citation Présence.</p>
          <p>Cliquez sur le bouton ci-dessous pour vérifier votre email :</p>
          <a href="${verificationUrl}"
             style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 16px 0;">
            Vérifier mon email
          </a>
          <p style="color: #666; font-size: 14px;">
            Ou copiez ce lien : ${verificationUrl}
          </p>
          <p style="color: #666; font-size: 12px;">
            Ce lien expire dans 24 heures.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      throw new Error(error.message);
    }

    console.log(`✅ Email envoyé à ${email} (ID: ${data?.id})`);
    return { success: true, id: data?.id };
  } catch (error) {
    console.error('❌ Erreur envoi email:', error);
    throw error;
  }
};
