import { WorkerMailer, SMTPConnectionOptions } from "worker-mailer";

export async function sendEmailViaSMTP(
  env: Env,
  to: string,
  subject: string,
  htmlBody: string
) {
  const smtpOptions: SMTPConnectionOptions = {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  };

  const mailer = await WorkerMailer.connect(smtpOptions);

  await mailer.send({
    from: env.EMAIL_FROM,
    to,
    subject,
    html: htmlBody,
  });

  await mailer.close();
}
