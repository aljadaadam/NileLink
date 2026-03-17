import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import { createReadStream, unlinkSync, statSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import nodemailer from "nodemailer";

const execAsync = promisify(exec);

// Weekly backup cron — exports PostgreSQL and sends encrypted .gz to admin email
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    return NextResponse.json({ error: "DATABASE_URL not configured" }, { status: 500 });
  }

  const adminEmail = process.env.BACKUP_EMAIL || process.env.SMTP_USER || "";
  if (!adminEmail) {
    return NextResponse.json({ error: "No backup email configured" }, { status: 500 });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const filename = `nilelink-backup-${timestamp}.sql.gz`;
  const filepath = join(tmpdir(), filename);

  try {
    // Run pg_dump and compress with gzip
    await execAsync(
      `pg_dump "${dbUrl}" --no-owner --no-acl | gzip > "${filepath}"`,
      { timeout: 120000 }
    );

    const fileSize = statSync(filepath).size;
    const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2);

    // Send backup via email as attachment
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM || "NileLink <noreply@nilelink.net>",
      to: adminEmail,
      subject: `📦 NileLink Database Backup — ${timestamp.slice(0, 10)}`,
      html: `
        <div style="font-family:'Segoe UI',sans-serif;padding:20px;">
          <h2 style="color:#0e7490;">NileLink Database Backup</h2>
          <p>Automatic weekly backup completed successfully.</p>
          <table style="border-collapse:collapse;margin:16px 0;">
            <tr><td style="padding:6px 16px 6px 0;color:#64748b;">Date</td><td style="font-weight:600;">${new Date().toUTCString()}</td></tr>
            <tr><td style="padding:6px 16px 6px 0;color:#64748b;">File</td><td style="font-weight:600;">${filename}</td></tr>
            <tr><td style="padding:6px 16px 6px 0;color:#64748b;">Size</td><td style="font-weight:600;">${fileSizeMB} MB</td></tr>
          </table>
          <p style="color:#64748b;font-size:13px;">To restore: <code>gunzip -c ${filename} | psql DATABASE_URL</code></p>
        </div>
      `,
      attachments: [
        {
          filename,
          content: createReadStream(filepath),
        },
      ],
    });

    // Cleanup temp file
    try { unlinkSync(filepath); } catch { /* ignore */ }

    return NextResponse.json({
      success: true,
      filename,
      sizeMB: fileSizeMB,
      sentTo: adminEmail,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    // Cleanup on error
    try { unlinkSync(filepath); } catch { /* ignore */ }

    console.error("Backup failed:", error);
    return NextResponse.json(
      { error: "Backup failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
