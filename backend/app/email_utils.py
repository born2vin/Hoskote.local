import os
import smtplib
import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

logger = logging.getLogger(__name__)

APP_NAME = "Supra Enclave Community Hub"


def render_reset_password_email(full_name: str, reset_link: str) -> str:
    """Return the HTML body for a password reset email."""
    return f"""\
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset your password</title>
</head>
<body style="margin:0; padding:0; background-color:#f3f6f7; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f6f7; padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:480px; background-color:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 4px 16px rgba(15,23,42,0.08);">
          <tr>
            <td style="background:linear-gradient(135deg,#244855 0%,#6366f1 100%); padding:28px 32px;">
              <span style="color:#ffffff; font-size:20px; font-weight:700; letter-spacing:-0.01em;">{APP_NAME}</span>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <h1 style="margin:0 0 16px; font-size:20px; color:#0f172a;">Reset your password</h1>
              <p style="margin:0 0 16px; font-size:15px; line-height:1.6; color:#334155;">
                Hi {full_name},
              </p>
              <p style="margin:0 0 24px; font-size:15px; line-height:1.6; color:#334155;">
                We received a request to reset the password for your account. Click the button below to
                choose a new one. This link expires in <strong>15 minutes</strong>.
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-radius:10px; background:linear-gradient(135deg,#244855 0%,#6366f1 100%);">
                    <a href="{reset_link}"
                       style="display:inline-block; padding:14px 32px; font-size:15px; font-weight:600;
                              color:#ffffff; text-decoration:none; border-radius:10px;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:24px 0 0; font-size:13px; line-height:1.6; color:#64748b;">
                If the button doesn't work, copy and paste this link into your browser:<br />
                <a href="{reset_link}" style="color:#6366f1; word-break:break-all;">{reset_link}</a>
              </p>
              <p style="margin:24px 0 0; font-size:13px; line-height:1.6; color:#64748b;">
                If you didn't request a password reset, you can safely ignore this email -- your password
                will not be changed.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px; background-color:#f8fafc; text-align:center;">
              <span style="font-size:12px; color:#94a3b8;">&copy; {APP_NAME}</span>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""


def send_password_reset_email(to_email: str, full_name: str, reset_link: str) -> None:
    """Send the password reset email via SMTP.

    Reads connection details from environment variables:
      SMTP_HOST, SMTP_PORT (default 587), SMTP_USERNAME, SMTP_PASSWORD,
      SMTP_FROM_EMAIL (defaults to SMTP_USERNAME), SMTP_FROM_NAME.

    If SMTP_HOST isn't configured (e.g. local development), the reset link
    is logged instead of emailed, so the flow stays testable without real
    SMTP credentials. Any error here is swallowed and logged rather than
    raised -- the caller must not let email delivery failures reveal
    whether the requested address has an account (see forgot_password).
    """
    smtp_host = os.environ.get("SMTP_HOST")
    from_name = os.environ.get("SMTP_FROM_NAME", APP_NAME)
    from_email = os.environ.get("SMTP_FROM_EMAIL") or os.environ.get("SMTP_USERNAME")

    if not smtp_host:
        logger.warning(
            "SMTP_HOST is not configured; skipping email send. "
            "Password reset link for %s: %s", to_email, reset_link
        )
        return

    smtp_port = int(os.environ.get("SMTP_PORT", "587"))
    smtp_username = os.environ.get("SMTP_USERNAME")
    smtp_password = os.environ.get("SMTP_PASSWORD")

    message = MIMEMultipart("alternative")
    message["Subject"] = f"Reset your {APP_NAME} password"
    message["From"] = f"{from_name} <{from_email}>"
    message["To"] = to_email
    message.attach(MIMEText(
        f"Reset your password using this link (expires in 15 minutes): {reset_link}",
        "plain",
    ))
    message.attach(MIMEText(render_reset_password_email(full_name, reset_link), "html"))

    try:
        with smtplib.SMTP(smtp_host, smtp_port, timeout=10) as server:
            server.starttls()
            if smtp_username and smtp_password:
                server.login(smtp_username, smtp_password)
            server.sendmail(from_email, [to_email], message.as_string())
    except Exception:
        logger.exception("Failed to send password reset email to %s", to_email)
