import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
from typing import Optional, List
from jinja2 import Template
import logging

from app.config.settings import settings

logger = logging.getLogger(__name__)


class EmailService:
    def __init__(self):
        self.smtp_server = settings.SMTP_SERVER
        self.smtp_port = settings.SMTP_PORT
        self.username = settings.SMTP_USERNAME
        self.password = settings.SMTP_PASSWORD
        self.from_email = settings.EMAIL_FROM

    def send_email(
        self,
        to_email: str,
        subject: str,
        body: str,
        html_body: Optional[str] = None,
        attachments: Optional[List[dict]] = None,
        cc: Optional[List[str]] = None,
        bcc: Optional[List[str]] = None,
    ) -> bool:
        """Send an email"""
        try:
            msg = MIMEMultipart("alternative")
            msg["From"] = self.from_email
            msg["To"] = to_email
            msg["Subject"] = subject

            if cc:
                msg["Cc"] = ", ".join(cc)
            if bcc:
                msg["Bcc"] = ", ".join(bcc)

            # Add plain text body
            msg.attach(MIMEText(body, "plain"))

            # Add HTML body if provided
            if html_body:
                msg.attach(MIMEText(html_body, "html"))

            # Add attachments
            if attachments:
                for attachment in attachments:
                    part = MIMEBase("application", "octet-stream")
                    part.set_payload(attachment["content"])
                    encoders.encode_base64(part)
                    part.add_header(
                        "Content-Disposition",
                        f'attachment; filename="{attachment["filename"]}"',
                    )
                    msg.attach(part)

            # Send email
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.username, self.password)
                server.send_message(msg)

            logger.info(f"Email sent successfully to {to_email}")
            return True

        except Exception as e:
            logger.error(f"Failed to send email: {str(e)}")
            return False

    def send_template_email(
        self,
        to_email: str,
        subject: str,
        template_name: str,
        template_data: dict,
        attachments: Optional[List[dict]] = None,
    ) -> bool:
        """Send an email using a template"""
        # Simple inline templates (in production, load from files)
        templates = {
            "welcome": {
                "subject": "Welcome to {site_name}!",
                "html": """
                <h1>Welcome, {name}!</h1>
                <p>Thank you for joining {site_name}. We're excited to have you on board.</p>
                <p>Click <a href="{verification_link}">here</a> to verify your email.</p>
                """,
            },
            "password_reset": {
                "subject": "Password Reset Request",
                "html": """
                <h1>Password Reset</h1>
                <p>Hello {name},</p>
                <p>You requested a password reset. Click the link below to reset your password:</p>
                <p><a href="{reset_link}">Reset Password</a></p>
                <p>This link will expire in {expiry_hours} hours.</p>
                <p>If you didn't request this, please ignore this email.</p>
                """,
            },
            "order_confirmation": {
                "subject": "Order Confirmation - {order_number}",
                "html": """
                <h1>Order Confirmation</h1>
                <p>Thank you for your order, {name}!</p>
                <p>Order Number: <strong>{order_number}</strong></p>
                <p>Total: {total}</p>
                <p>We'll notify you when your order ships.</p>
                """,
            },
            "seller_approved": {
                "subject": "Seller Application Approved!",
                "html": """
                <h1>Congratulations!</h1>
                <p>Hello {name},</p>
                <p>Your seller application has been <strong>approved</strong>!</p>
                <p>You can now start listing products and selling on our platform.</p>
                <p><a href="{dashboard_link}">Go to Seller Dashboard</a></p>
                """,
            },
            "seller_rejected": {
                "subject": "Seller Application Status",
                "html": """
                <h1>Application Update</h1>
                <p>Hello {name},</p>
                <p>We regret to inform you that your seller application has been declined.</p>
                <p>Reason: {reason}</p>
                <p>If you believe this is an error, please contact our support team.</p>
                """,
            },
        }

        template = templates.get(template_name, {})
        subject = template.get("subject", subject).format(**template_data)
        html_body = template.get("html", "").format(**template_data)
        plain_body = (
            html_body.replace("<h1>", "")
            .replace("</h1>", "\n\n")
            .replace("<p>", "")
            .replace("</p>", "\n")
            .replace("<strong>", "")
            .replace("</strong>", "")
            .replace('<a href="', "")
            .replace('">', " (")
            .replace("</a>", ")")
        )

        return self.send_email(to_email, subject, plain_body, html_body, attachments)


# Global email service instance
email_service = EmailService()
