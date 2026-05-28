import axios from 'axios';
import nodemailer from 'nodemailer';

export class EmailService {
  private static async getTransporter() {
    if (process.env.SMTP_HOST && process.env.EMAIL_USER) {
      return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
    }
    return null;
  }

  static async sendReceipt(email: string, txn: any) {
    if (!email || email === 'none') return;

    const sc = txn.deliveryStatus === 'delivered' ? '#16a34a' : txn.deliveryStatus === 'failed' ? '#dc2626' : '#d97706';
    const failNote = txn.deliveryStatus === 'failed'
      ? `<p style="background:#fef2f2;border-radius:8px;padding:10px;color:#991b1b;font-size:13px">
          Delivery failed. Our team will resolve this within 1 hour or issue a refund.<br>
          Ref: <b>${txn.ref}</b> - Support: <b>${process.env.SUPPORT_PHONE || '08140112803'}</b>
        </p>` : '';

    const emailHtml = `
      <div style="font-family:'Segoe UI',sans-serif;max-width:560px;margin:0 auto">
        <div style="background:linear-gradient(135deg,#0a0f2e,#0d1b4e);padding:28px;border-radius:12px 12px 0 0;text-align:center">
          <h1 style="color:#38bdf8;margin:0;font-size:24px">DATAHUB</h1>
          <p style="color:rgba(255,255,255,.5);font-size:12px;margin:4px 0 0">Purchase Receipt</p>
        </div>
        <div style="background:#f8fafc;padding:28px">
          <div style="background:white;border-radius:10px;padding:20px;border:1px solid #e2e8f0">
            <p><b>Reference:</b> <code>${txn.ref}</code></p>
            <p><b>Product:</b> ${txn.product}</p>
            <p><b>Recipient:</b> ${txn.recipient}</p>
            <p><b>Amount Paid:</b> <span style="color:#0a0f2e;font-size:18px;font-weight:700">N${(txn.amount || 0).toLocaleString()}</span></p>
            <p><b>Delivery:</b> <span style="color:${sc};font-weight:700;text-transform:capitalize">${txn.deliveryStatus}</span></p>
            ${failNote}
          </div>
          <p style="text-align:center;font-size:12px;color:#94a3b8;margin-top:16px">
            Need help? Call/WhatsApp: <b>${process.env.SUPPORT_PHONE || '08140112803'}</b>
          </p>
        </div>
      </div>`;

    try {
      const transporter = await this.getTransporter();
      if (transporter) {
        await transporter.sendMail({
          from: `DATAHUB <${process.env.EMAIL_USER}>`,
          to: email,
          subject: `DATAHUB ${txn.deliveryStatus === 'delivered' ? 'Receipt' : 'Issue'} - ${txn.ref}`,
          html: emailHtml,
        });
        return;
      }

      if (process.env.RESEND_API_KEY) {
        await axios.post('https://api.resend.com/emails', {
          from: 'noreply@sescoconcept.name.ng',
          to: [email],
          subject: `DATAHUB ${txn.deliveryStatus === 'delivered' ? 'Receipt' : 'Issue'} - ${txn.ref}`,
          html: emailHtml,
        }, {
          headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` }
        });
      }
    } catch (e) {
      console.error('Email receipt error:', e);
    }
  }

  static async sendAdminAlert(txn: any) {
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
    if (!adminEmail) return;

    const alertText = [
      'DATAHUB Sale Alert',
      `Ref: ${txn.ref}`,
      `Product: ${txn.product}`,
      `Recipient: ${txn.recipient}`,
      `Customer: ${txn.customerEmail}`,
      `Amount: N${(txn.amount || 0).toLocaleString()}`,
      `Profit: N${(txn.profit || 0).toLocaleString()}`,
      `Delivery: ${txn.deliveryStatus}`,
      txn.failReason ? `Fail Reason: ${txn.failReason}` : '',
      txn.deliveryError ? `Error: ${txn.deliveryError}` : '',
      txn.deliveryStatus === 'failed' ? '\\nACTION: Admin panel -> Transactions -> Retry!' : ''
    ].filter(Boolean).join('\\n');

    try {
      const transporter = await this.getTransporter();
      if (transporter) {
        await transporter.sendMail({
          from: `DATAHUB System <${process.env.EMAIL_USER}>`,
          to: adminEmail,
          subject: `[DATAHUB] ${txn.deliveryStatus === 'delivered' ? 'SUCCESS' : 'FAILED'}: ${txn.product} - N${(txn.amount || 0).toLocaleString()}`,
          text: alertText,
        });
        return;
      }

      if (process.env.RESEND_API_KEY) {
        await axios.post('https://api.resend.com/emails', {
          from: 'noreply@sescoconcept.name.ng',
          to: [adminEmail],
          subject: `[DATAHUB] ${txn.deliveryStatus === 'delivered' ? 'SUCCESS' : 'FAILED'}: ${txn.product} - N${(txn.amount || 0).toLocaleString()}`,
          html: `<pre style="font-family:monospace">${alertText}</pre>`,
        }, {
          headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` }
        });
      }
    } catch (e) {
      console.error('Admin alert error:', e);
    }
  }
}
