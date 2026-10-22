import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import nodemailer from 'nodemailer';

function emailDispatcherPlugin(): Plugin {
  return {
    name: 'email-dispatcher',
    configureServer(server) {
      server.middlewares.use('/api/v1/send-email', (req, res) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', async () => {
            try {
              const data = JSON.parse(body || '{}');
              const { to, subject, text, otp } = data;

              const host = process.env.SMTP_HOST || 'smtp.gmail.com';
              const port = Number(process.env.SMTP_PORT) || 465;
              const user = process.env.SMTP_USER || 'ankitakhot015@gmail.com';
              const pass = process.env.SMTP_PASS || '';

              let sentOverSmtp = false;
              let smtpError = null;

              if (pass && !pass.includes('replace_with')) {
                try {
                  const transporter = nodemailer.createTransport({
                    host,
                    port,
                    secure: port === 465,
                    auth: { user, pass },
                  });
                  await transporter.sendMail({
                    from: process.env.SMTP_FROM || `Kolhapuri Fashion Saree <${user}>`,
                    to,
                    subject,
                    text: text || `Your verification OTP is: ${otp}`,
                    html: `
                      <div style="font-family: Georgia, serif; max-width: 550px; margin: 0 auto; padding: 24px; background: #FAF7F0; color: #292522; border: 1px solid #E6E0D8; border-radius: 8px;">
                        <div style="text-align: center; margin-bottom: 20px;">
                          <h2 style="color: #641D32; margin: 0;">Kolhapuri Fashion Saree</h2>
                          <p style="font-size: 11px; text-transform: uppercase; color: #766B61; margin: 4px 0;">Authentic Handloom Weaves · Kolhapur</p>
                        </div>
                        <p style="font-size: 14px;">Namaste,</p>
                        <p style="font-size: 14px; line-height: 1.6;">Use the following single-use verification code to complete your sign-in / order checkout:</p>
                        <div style="text-align: center; margin: 24px 0; padding: 18px; background: #FFFFFF; border: 2px dashed #C7A66A; border-radius: 8px;">
                          <span style="font-size: 32px; font-weight: bold; font-family: monospace; letter-spacing: 6px; color: #641D32;">${otp}</span>
                        </div>
                        <p style="font-size: 12px; color: #766B61;">This OTP is valid for 5 minutes. Never share this code with anyone.</p>
                        <p style="font-size: 11px; color: #766B61; margin-top: 24px; border-top: 1px solid #E6E0D8; padding-top: 12px;">Kolhapuri Fashion Saree, Shivaji Nagar, Unchgaon, Kolhapur, Maharashtra. Ph: 9096863092</p>
                      </div>
                    `,
                  });
                  sentOverSmtp = true;
                  console.log(`[SMTP] Successfully dispatched OTP to ${to}`);
                } catch (e: any) {
                  smtpError = e.message;
                  console.warn(`[SMTP Notice] Could not deliver to ${to}: ${e.message}`);
                }
              }

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, sentOverSmtp, smtpError, to }));
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
        } else {
          res.statusCode = 405;
          res.end('Method not allowed');
        }
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), emailDispatcherPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
