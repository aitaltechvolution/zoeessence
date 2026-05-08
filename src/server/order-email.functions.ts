import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const inputSchema = z.object({
  customerName: z.string().trim().min(1).max(200),
  customerEmail: z.string().trim().toLowerCase().email().max(255),
  customerPhone: z.string().trim().max(50).optional().nullable(),
  address: z.string().trim().max(500).optional().nullable(),
  productTitle: z.string().trim().min(1).max(300),
  quantity: z.number().int().min(1).max(1000),
  unitPrice: z.number().min(0),
  total: z.number().min(0),
});

const ADMIN_EMAIL = "hello.aitaltech@gmail.com";
// NOTE: onboarding@resend.dev is Resend's shared sandbox sender and lands in spam.
// To get inbox delivery, verify your own domain in Resend and update FROM below
// to e.g. "Zoe Essence <orders@yourdomain.com>".
const FROM = "Zoe Essence <onboarding@resend.dev>";

const fmtNaira = (n: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(n);

function escape(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function sendEmail(payload: {
  to: string[];
  subject: string;
  html: string;
  text: string;
  reply_to?: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY not configured");
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: FROM, ...payload }),
  });
  if (!res.ok) {
    const text = await res.text();
    console.error("Resend error", res.status, text);
    throw new Error(`Resend send failed: ${res.status} ${text}`);
  }
  return res.json();
}

export const sendOrderConfirmation = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }) => {
    const name = escape(data.customerName);
    const product = escape(data.productTitle);
    const phone = data.customerPhone ? escape(data.customerPhone) : "";
    const address = data.address ? escape(data.address) : "";

    const customerHtml = `<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#faf8f5;font-family:Georgia,'Times New Roman',serif;color:#1a1a1a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #ece7df;">
        <tr><td style="padding:32px 36px;border-bottom:1px solid #ece7df;text-align:center;">
          <div style="font-size:11px;letter-spacing:.3em;text-transform:uppercase;color:#9a8b6a;">Zoe Essence</div>
        </td></tr>
        <tr><td style="padding:36px;">
          <h1 style="font-size:24px;margin:0 0 16px;font-weight:400;">Thank you, ${name}.</h1>
          <p style="font-size:15px;line-height:1.6;color:#444;margin:0 0 24px;">
            We've received your order and our team will reach out shortly via phone or WhatsApp to confirm payment and delivery details.
          </p>
          <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #ece7df;border-bottom:1px solid #ece7df;margin:24px 0;">
            <tr><td style="padding:14px 0;font-size:13px;color:#666;">Product</td><td style="padding:14px 0;text-align:right;font-size:14px;">${product}</td></tr>
            <tr><td style="padding:14px 0;font-size:13px;color:#666;border-top:1px solid #f3efea;">Quantity</td><td style="padding:14px 0;text-align:right;font-size:14px;border-top:1px solid #f3efea;">${data.quantity}</td></tr>
            <tr><td style="padding:14px 0;font-size:13px;color:#666;border-top:1px solid #f3efea;">Unit price</td><td style="padding:14px 0;text-align:right;font-size:14px;border-top:1px solid #f3efea;">${fmtNaira(data.unitPrice)}</td></tr>
            <tr><td style="padding:16px 0;font-size:13px;color:#666;border-top:1px solid #f3efea;text-transform:uppercase;letter-spacing:.15em;">Total</td><td style="padding:16px 0;text-align:right;font-size:18px;border-top:1px solid #f3efea;">${fmtNaira(data.total)}</td></tr>
          </table>
          ${address ? `<p style="font-size:13px;color:#666;margin:0 0 8px;"><strong style="color:#1a1a1a;">Deliver to:</strong> ${address}</p>` : ""}
          <p style="font-size:13px;color:#888;margin:24px 0 0;line-height:1.6;">
            Questions? Just reply to this email and we'll get back to you.
          </p>
        </td></tr>
        <tr><td style="padding:20px 36px;background:#faf8f5;text-align:center;font-size:11px;color:#999;letter-spacing:.1em;">
          ZOE ESSENCE · Crafted with care
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

    const customerText = `Thank you, ${data.customerName}.

We've received your order. Our team will reach out shortly to confirm payment and delivery.

Product: ${data.productTitle}
Quantity: ${data.quantity}
Unit price: ${fmtNaira(data.unitPrice)}
Total: ${fmtNaira(data.total)}
${data.address ? `\nDeliver to: ${data.address}` : ""}

Reply to this email if you have any questions.

— Zoe Essence`;

    const adminHtml = `<!DOCTYPE html>
<html><body style="font-family:Arial,sans-serif;color:#222;padding:24px;">
  <h2 style="margin:0 0 16px;">New order received</h2>
  <table cellpadding="6" cellspacing="0" style="border-collapse:collapse;font-size:14px;">
    <tr><td><strong>Customer</strong></td><td>${name}</td></tr>
    <tr><td><strong>Email</strong></td><td>${escape(data.customerEmail)}</td></tr>
    ${phone ? `<tr><td><strong>Phone</strong></td><td>${phone}</td></tr>` : ""}
    ${address ? `<tr><td><strong>Address</strong></td><td>${address}</td></tr>` : ""}
    <tr><td><strong>Product</strong></td><td>${product}</td></tr>
    <tr><td><strong>Quantity</strong></td><td>${data.quantity}</td></tr>
    <tr><td><strong>Unit price</strong></td><td>${fmtNaira(data.unitPrice)}</td></tr>
    <tr><td><strong>Total</strong></td><td><strong>${fmtNaira(data.total)}</strong></td></tr>
  </table>
</body></html>`;

    const adminText = `New order

Customer: ${data.customerName} <${data.customerEmail}>
${data.customerPhone ? `Phone: ${data.customerPhone}\n` : ""}${data.address ? `Address: ${data.address}\n` : ""}Product: ${data.productTitle}
Quantity: ${data.quantity}
Unit price: ${fmtNaira(data.unitPrice)}
Total: ${fmtNaira(data.total)}`;

    const results = await Promise.allSettled([
      sendEmail({
        to: [data.customerEmail],
        subject: `Your Zoe Essence order — ${data.productTitle}`,
        html: customerHtml,
        text: customerText,
        reply_to: ADMIN_EMAIL,
      }),
      sendEmail({
        to: [ADMIN_EMAIL],
        subject: `New order: ${data.productTitle} × ${data.quantity}`,
        html: adminHtml,
        text: adminText,
        reply_to: data.customerEmail,
      }),
    ]);

    const failed = results.filter((r) => r.status === "rejected");
    if (failed.length) {
      console.error("Order email partial/total failure", failed);
    }
    return {
      ok: failed.length === 0,
      customerEmailSent: results[0].status === "fulfilled",
      adminEmailSent: results[1].status === "fulfilled",
    };
  });
