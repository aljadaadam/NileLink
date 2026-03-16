// ─── Email HTML Templates ────────────────────────────────────

const BRAND_COLOR = "#0891b2";
const BRAND_NAME = "NileLink";

function baseLayout(content: string): string {
  return `<!DOCTYPE html>
<html dir="ltr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
          <!-- Header -->
          <tr>
            <td style="background:${BRAND_COLOR};padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.5px;">
                📡 ${BRAND_NAME}
              </h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:40px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px 32px;text-align:center;border-top:1px solid #f1f5f9;">
              <p style="margin:0;color:#94a3b8;font-size:12px;">
                &copy; ${new Date().getFullYear()} ${BRAND_NAME}. All rights reserved.
              </p>
              <p style="margin:8px 0 0;color:#cbd5e1;font-size:11px;">
                MikroTik Hotspot Management Platform
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── Verification Code Email ────────────────────────────────

export function verificationCodeEmail(code: string, name: string): string {
  return baseLayout(`
    <h2 style="margin:0 0 8px;color:#1e293b;font-size:20px;font-weight:700;">
      Verify Your Email
    </h2>
    <p style="margin:0 0 24px;color:#64748b;font-size:14px;line-height:1.6;">
      Hi ${name}, welcome to ${BRAND_NAME}! Use the code below to verify your email address.
    </p>
    <div style="background:#f8fafc;border:2px dashed ${BRAND_COLOR};border-radius:12px;padding:24px;text-align:center;margin:0 0 24px;">
      <p style="margin:0 0 8px;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:1px;">
        Your verification code
      </p>
      <p style="margin:0;color:${BRAND_COLOR};font-size:36px;font-weight:800;letter-spacing:8px;font-family:monospace;">
        ${code}
      </p>
    </div>
    <p style="margin:0 0 4px;color:#94a3b8;font-size:13px;">
      ⏱ This code expires in <strong style="color:#1e293b;">10 minutes</strong>.
    </p>
    <p style="margin:0;color:#94a3b8;font-size:13px;">
      If you didn't create an account, you can safely ignore this email.
    </p>
  `);
}

// ─── Login OTP Email (new device detection) ─────────────────

export function loginOtpEmail(code: string, name: string, ip: string, userAgent: string): string {
  const shortUA = userAgent.length > 80 ? userAgent.substring(0, 80) + "..." : userAgent;
  return baseLayout(`
    <h2 style="margin:0 0 8px;color:#1e293b;font-size:20px;font-weight:700;">
      New Login Detected
    </h2>
    <p style="margin:0 0 16px;color:#64748b;font-size:14px;line-height:1.6;">
      Hi ${name}, someone is trying to sign in to your ${BRAND_NAME} account from a new device. If this is you, use the code below to continue.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
      <tr>
        <td style="padding:12px 16px;background:#fef3c7;border-radius:8px;border-left:4px solid #f59e0b;">
          <p style="margin:0 0 4px;color:#1e293b;font-size:13px;font-weight:600;">🔍 Login Details:</p>
          <p style="margin:0;color:#64748b;font-size:12px;">IP: ${ip}</p>
          <p style="margin:0;color:#64748b;font-size:12px;">Device: ${shortUA}</p>
        </td>
      </tr>
    </table>
    <div style="background:#f8fafc;border:2px dashed ${BRAND_COLOR};border-radius:12px;padding:24px;text-align:center;margin:0 0 24px;">
      <p style="margin:0 0 8px;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:1px;">
        Your login verification code
      </p>
      <p style="margin:0;color:${BRAND_COLOR};font-size:36px;font-weight:800;letter-spacing:8px;font-family:monospace;">
        ${code}
      </p>
    </div>
    <p style="margin:0 0 4px;color:#94a3b8;font-size:13px;">
      ⏱ This code expires in <strong style="color:#1e293b;">10 minutes</strong>.
    </p>
    <p style="margin:0;color:#ef4444;font-size:13px;font-weight:500;">
      ⚠️ If you did NOT try to sign in, someone may have your password. Change it immediately.
    </p>
  `);
}

// ─── Welcome Email (after verification) ─────────────────────

export function welcomeEmail(name: string): string {
  return baseLayout(`
    <div style="text-align:center;margin:0 0 24px;">
      <div style="display:inline-block;width:64px;height:64px;background:#ecfdf5;border-radius:50%;line-height:64px;font-size:28px;">
        ✅
      </div>
    </div>
    <h2 style="margin:0 0 8px;color:#1e293b;font-size:20px;font-weight:700;text-align:center;">
      Welcome to ${BRAND_NAME}!
    </h2>
    <p style="margin:0 0 24px;color:#64748b;font-size:14px;line-height:1.6;text-align:center;">
      Hi ${name}, your email has been verified. You're all set to start managing your MikroTik hotspot networks.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr>
        <td style="padding:12px 16px;background:#f0fdfa;border-radius:8px;border-left:4px solid ${BRAND_COLOR};">
          <p style="margin:0 0 4px;color:#1e293b;font-size:13px;font-weight:600;">🚀 Get started:</p>
          <p style="margin:0;color:#64748b;font-size:13px;">Choose your plan → Add a router → Generate vouchers</p>
        </td>
      </tr>
    </table>
    <div style="text-align:center;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://nilelink.net"}/en/auth/login"
         style="display:inline-block;padding:12px 32px;background:${BRAND_COLOR};color:#ffffff;text-decoration:none;border-radius:10px;font-size:14px;font-weight:600;">
        Go to Dashboard
      </a>
    </div>
  `);
}

// ─── Password Reset Email ───────────────────────────────────

export function passwordResetEmail(code: string, name: string): string {
  return baseLayout(`
    <h2 style="margin:0 0 8px;color:#1e293b;font-size:20px;font-weight:700;">
      Reset Your Password
    </h2>
    <p style="margin:0 0 24px;color:#64748b;font-size:14px;line-height:1.6;">
      Hi ${name}, we received a request to reset your password. Use the code below:
    </p>
    <div style="background:#fef2f2;border:2px dashed #ef4444;border-radius:12px;padding:24px;text-align:center;margin:0 0 24px;">
      <p style="margin:0 0 8px;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:1px;">
        Password Reset Code
      </p>
      <p style="margin:0;color:#ef4444;font-size:36px;font-weight:800;letter-spacing:8px;font-family:monospace;">
        ${code}
      </p>
    </div>
    <p style="margin:0 0 4px;color:#94a3b8;font-size:13px;">
      ⏱ This code expires in <strong style="color:#1e293b;">10 minutes</strong>.
    </p>
    <p style="margin:0;color:#94a3b8;font-size:13px;">
      If you didn't request a password reset, please ignore this email.
    </p>
  `);
}

// ─── Trial Expiring Email ───────────────────────────────────

export function trialExpiringEmail(name: string, daysLeft: number): string {
  return baseLayout(`
    <div style="text-align:center;margin:0 0 24px;">
      <div style="display:inline-block;width:64px;height:64px;background:#fef3c7;border-radius:50%;line-height:64px;font-size:28px;">
        ⚠️
      </div>
    </div>
    <h2 style="margin:0 0 8px;color:#1e293b;font-size:20px;font-weight:700;text-align:center;">
      Your Trial Ends in ${daysLeft} Day${daysLeft > 1 ? "s" : ""}
    </h2>
    <p style="margin:0 0 24px;color:#64748b;font-size:14px;line-height:1.6;text-align:center;">
      Hi ${name}, your free trial is about to expire. Upgrade now to keep managing your hotspot networks without any interruption.
    </p>
    <div style="text-align:center;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://nilelink.net"}/en/manage-nl7x9k2p/billing"
         style="display:inline-block;padding:12px 32px;background:${BRAND_COLOR};color:#ffffff;text-decoration:none;border-radius:10px;font-size:14px;font-weight:600;">
        View Plans & Upgrade
      </a>
    </div>
  `);
}

// ─── Invoice Email ──────────────────────────────────────────

export function invoiceEmail(
  name: string,
  invoiceNumber: string,
  plan: string,
  amount: string,
  currency: string,
  dueDate: string
): string {
  return baseLayout(`
    <h2 style="margin:0 0 8px;color:#1e293b;font-size:20px;font-weight:700;">
      New Invoice
    </h2>
    <p style="margin:0 0 24px;color:#64748b;font-size:14px;line-height:1.6;">
      Hi ${name}, a new invoice has been generated for your subscription.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
      <tr style="background:#f8fafc;">
        <td style="padding:12px 16px;color:#64748b;font-size:13px;">Invoice #</td>
        <td style="padding:12px 16px;color:#1e293b;font-size:13px;font-weight:600;text-align:right;">${invoiceNumber}</td>
      </tr>
      <tr>
        <td style="padding:12px 16px;color:#64748b;font-size:13px;border-top:1px solid #f1f5f9;">Plan</td>
        <td style="padding:12px 16px;color:#1e293b;font-size:13px;font-weight:600;text-align:right;border-top:1px solid #f1f5f9;">${plan}</td>
      </tr>
      <tr style="background:#f8fafc;">
        <td style="padding:12px 16px;color:#64748b;font-size:13px;">Amount</td>
        <td style="padding:12px 16px;color:${BRAND_COLOR};font-size:16px;font-weight:700;text-align:right;">${amount} ${currency}</td>
      </tr>
      <tr>
        <td style="padding:12px 16px;color:#64748b;font-size:13px;border-top:1px solid #f1f5f9;">Due Date</td>
        <td style="padding:12px 16px;color:#1e293b;font-size:13px;font-weight:600;text-align:right;border-top:1px solid #f1f5f9;">${dueDate}</td>
      </tr>
    </table>
    <div style="text-align:center;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://nilelink.net"}/en/manage-nl7x9k2p/billing"
         style="display:inline-block;padding:12px 32px;background:${BRAND_COLOR};color:#ffffff;text-decoration:none;border-radius:10px;font-size:14px;font-weight:600;">
        View Invoice
      </a>
    </div>
  `);
}
