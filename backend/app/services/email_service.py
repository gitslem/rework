"""Email notification service using MailerSend"""
from typing import Optional
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

# Try to import MailerSend - gracefully handle if not available
try:
    from mailersend import MailerSendClient, EmailBuilder
    MAILERSEND_AVAILABLE = True
    logger.info("MailerSend module loaded successfully")
except ImportError as e:
    logger.warning(f"MailerSend module not available: {e}. Email functionality will be disabled.")
    MAILERSEND_AVAILABLE = False
    MailerSendClient = None
    EmailBuilder = None


class EmailService:
    """Service for sending email notifications"""

    def __init__(self):
        """Initialize the email service with MailerSend API key"""
        self.api_key = settings.MAILERSEND_API_KEY
        self.from_email = settings.FROM_EMAIL
        self.from_name = settings.FROM_NAME
        self.frontend_url = settings.FRONTEND_URL
        self.client = None

        if MAILERSEND_AVAILABLE and self.api_key:
            try:
                # Initialize MailerSend client with API key
                self.client = MailerSendClient(api_key=self.api_key)
                logger.info("MailerSend email service initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize MailerSend client: {e}")
                self.client = None
        else:
            if not MAILERSEND_AVAILABLE:
                logger.warning("Email service disabled: MailerSend not available")
            elif not self.api_key:
                logger.warning("Email service disabled: No API key configured")

    def _send_email(self, to_email: str, to_name: str, subject: str, html_content: str, text_content: str = None) -> bool:
        """
        Internal method to send email via MailerSend

        Args:
            to_email: Recipient email address
            to_name: Recipient name
            subject: Email subject
            html_content: HTML content of the email
            text_content: Plain text content (optional)

        Returns:
            True if email sent successfully, False otherwise
        """
        if not self.client or not MAILERSEND_AVAILABLE:
            logger.warning("Email service not available. Email not sent.")
            return False

        if not self.api_key or self.api_key == "":
            logger.warning("MailerSend API key not configured. Email not sent.")
            return False

        try:
            # Build email using modern MailerSend API (v2.0+)
            logger.info(f"Attempting to send email to {to_email} with subject: {subject}")
            logger.info(f"Using sender: {self.from_name} <{self.from_email}>")

            # Use EmailBuilder with fluent interface
            email_builder = (EmailBuilder()
                .from_email(self.from_email, self.from_name)
                .to_many([{"email": to_email, "name": to_name}])
                .subject(subject)
                .html(html_content))

            # Add plain text if provided
            if text_content:
                email_builder = email_builder.text(text_content)

            # Build and send
            email = email_builder.build()
            response = self.client.emails.send(email)

            # Check response - MailerSend returns message_id on success
            if hasattr(response, 'message_id') and response.message_id:
                logger.info(f"✅ Email sent successfully to {to_email} (message_id: {response.message_id})")
                return True
            else:
                logger.error(f"❌ Failed to send email to {to_email} - Response: {response}")
                return False

        except Exception as e:
            logger.error(f"❌ Error sending email to {to_email}: {str(e)}")
            logger.exception("Full traceback:")
            return False

    def send_project_created_notification(
        self,
        candidate_email: str,
        candidate_name: str,
        agent_name: str,
        project_title: str,
        project_description: str,
        project_id: str,  # Can be int or str (Firebase ID)
        platform: Optional[str] = None
    ) -> bool:
        """
        Send notification when an agent creates a new project for a candidate

        Args:
            candidate_email: Candidate's email address
            candidate_name: Candidate's name
            agent_name: Agent's name
            project_title: Project title
            project_description: Project description
            project_id: Project ID
            platform: Platform name (optional)

        Returns:
            True if email sent successfully
        """
        subject = f"New Project Created: {project_title}"

        platform_text = f" on {platform}" if platform else ""

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {{
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }}
                .header {{
                    background: linear-gradient(135deg, #000000 0%, #262626 100%);
                    color: white;
                    padding: 30px;
                    text-align: center;
                    border-radius: 8px 8px 0 0;
                }}
                .content {{
                    background: #ffffff;
                    padding: 30px;
                    border: 1px solid #e5e5e5;
                }}
                .project-card {{
                    background: #f5f5f5;
                    border-left: 4px solid #000000;
                    padding: 20px;
                    margin: 20px 0;
                    border-radius: 4px;
                }}
                .button {{
                    display: inline-block;
                    background: #000000;
                    color: white;
                    padding: 12px 30px;
                    text-decoration: none;
                    border-radius: 25px;
                    margin: 20px 0;
                    font-weight: 600;
                }}
                .footer {{
                    background: #f5f5f5;
                    padding: 20px;
                    text-align: center;
                    font-size: 12px;
                    color: #737373;
                    border-radius: 0 0 8px 8px;
                }}
                h2 {{
                    color: #000000;
                    margin-top: 0;
                }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1 style="margin: 0; font-size: 28px;">🎯 New Project Created</h1>
            </div>

            <div class="content">
                <p>Hi {candidate_name},</p>

                <p>Great news! Your agent <strong>{agent_name}</strong> has created a new project for you{platform_text}.</p>

                <div class="project-card">
                    <h2>{project_title}</h2>
                    <p>{project_description}</p>
                </div>

                <p>This project has been added to your dashboard. You can view all details, updates, and actions by visiting your project page.</p>

                <div style="text-align: center;">
                    <a href="{self.frontend_url}/candidate-projects/{project_id}" class="button">View Project Details</a>
                </div>

                <p>If you have any questions about this project, feel free to reach out to your agent or our support team.</p>

                <p>Best regards,<br>
                <strong>The Remote-Works Team</strong></p>
            </div>

            <div class="footer">
                <p>You're receiving this email because your agent created a new project for you on Remote-Works.</p>
                <p>&copy; 2024 Remote-Works. All rights reserved.</p>
            </div>
        </body>
        </html>
        """

        text_content = f"""
        New Project Created: {project_title}

        Hi {candidate_name},

        Great news! Your agent {agent_name} has created a new project for you{platform_text}.

        Project: {project_title}
        {project_description}

        View your project at: {self.frontend_url}/candidate-projects/{project_id}

        Best regards,
        The Remote-Works Team
        """

        return self._send_email(candidate_email, candidate_name, subject, html_content, text_content)

    def send_project_updated_notification(
        self,
        candidate_email: str,
        candidate_name: str,
        agent_name: str,
        project_title: str,
        project_id: str,  # Can be int or str (Firebase ID)
        update_summary: Optional[str] = None
    ) -> bool:
        """
        Send notification when an agent updates a project

        Args:
            candidate_email: Candidate's email address
            candidate_name: Candidate's name
            agent_name: Agent's name
            project_title: Project title
            project_id: Project ID
            update_summary: Summary of what was updated (optional)

        Returns:
            True if email sent successfully
        """
        subject = f"Project Updated: {project_title}"

        update_text = f"<p><strong>What changed:</strong> {update_summary}</p>" if update_summary else ""
        update_text_plain = f"\n\nWhat changed: {update_summary}" if update_summary else ""

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {{
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }}
                .header {{
                    background: linear-gradient(135deg, #000000 0%, #262626 100%);
                    color: white;
                    padding: 30px;
                    text-align: center;
                    border-radius: 8px 8px 0 0;
                }}
                .content {{
                    background: #ffffff;
                    padding: 30px;
                    border: 1px solid #e5e5e5;
                }}
                .update-card {{
                    background: #f5f5f5;
                    border-left: 4px solid #000000;
                    padding: 20px;
                    margin: 20px 0;
                    border-radius: 4px;
                }}
                .button {{
                    display: inline-block;
                    background: #000000;
                    color: white;
                    padding: 12px 30px;
                    text-decoration: none;
                    border-radius: 25px;
                    margin: 20px 0;
                    font-weight: 600;
                }}
                .footer {{
                    background: #f5f5f5;
                    padding: 20px;
                    text-align: center;
                    font-size: 12px;
                    color: #737373;
                    border-radius: 0 0 8px 8px;
                }}
                h2 {{
                    color: #000000;
                    margin-top: 0;
                }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1 style="margin: 0; font-size: 28px;">📝 Project Updated</h1>
            </div>

            <div class="content">
                <p>Hi {candidate_name},</p>

                <p>Your agent <strong>{agent_name}</strong> has made updates to your project:</p>

                <div class="update-card">
                    <h2>{project_title}</h2>
                    {update_text}
                </div>

                <p>Check out the latest changes and stay up to date with your project progress.</p>

                <div style="text-align: center;">
                    <a href="{self.frontend_url}/candidate-projects/{project_id}" class="button">View Updated Project</a>
                </div>

                <p>If you have any questions about these updates, don't hesitate to contact your agent.</p>

                <p>Best regards,<br>
                <strong>The Remote-Works Team</strong></p>
            </div>

            <div class="footer">
                <p>You're receiving this email because your project was updated on Remote-Works.</p>
                <p>&copy; 2024 Remote-Works. All rights reserved.</p>
            </div>
        </body>
        </html>
        """

        text_content = f"""
        Project Updated: {project_title}

        Hi {candidate_name},

        Your agent {agent_name} has made updates to your project: {project_title}{update_text_plain}

        View your updated project at: {self.frontend_url}/candidate-projects/{project_id}

        Best regards,
        The Remote-Works Team
        """

        return self._send_email(candidate_email, candidate_name, subject, html_content, text_content)

    def send_project_status_changed_notification(
        self,
        candidate_email: str,
        candidate_name: str,
        agent_name: str,
        project_title: str,
        project_id: str,  # Can be int or str (Firebase ID)
        old_status: str,
        new_status: str
    ) -> bool:
        """
        Send notification when project status changes

        Args:
            candidate_email: Candidate's email address
            candidate_name: Candidate's name
            agent_name: Agent's name
            project_title: Project title
            project_id: Project ID
            old_status: Previous status
            new_status: New status

        Returns:
            True if email sent successfully
        """
        subject = f"Project Status Changed: {project_title}"

        # Status emoji mapping
        status_emoji = {
            "PENDING": "⏳",
            "ACTIVE": "🚀",
            "COMPLETED": "✅",
            "ON_HOLD": "⏸️",
            "CANCELLED": "❌"
        }

        emoji = status_emoji.get(new_status, "📌")

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {{
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }}
                .header {{
                    background: linear-gradient(135deg, #000000 0%, #262626 100%);
                    color: white;
                    padding: 30px;
                    text-align: center;
                    border-radius: 8px 8px 0 0;
                }}
                .content {{
                    background: #ffffff;
                    padding: 30px;
                    border: 1px solid #e5e5e5;
                }}
                .status-card {{
                    background: #f5f5f5;
                    border-left: 4px solid #000000;
                    padding: 20px;
                    margin: 20px 0;
                    border-radius: 4px;
                }}
                .status-change {{
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    margin: 15px 0;
                    font-size: 18px;
                }}
                .button {{
                    display: inline-block;
                    background: #000000;
                    color: white;
                    padding: 12px 30px;
                    text-decoration: none;
                    border-radius: 25px;
                    margin: 20px 0;
                    font-weight: 600;
                }}
                .footer {{
                    background: #f5f5f5;
                    padding: 20px;
                    text-align: center;
                    font-size: 12px;
                    color: #737373;
                    border-radius: 0 0 8px 8px;
                }}
                h2 {{
                    color: #000000;
                    margin-top: 0;
                }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1 style="margin: 0; font-size: 28px;">{emoji} Status Changed</h1>
            </div>

            <div class="content">
                <p>Hi {candidate_name},</p>

                <p>Your agent <strong>{agent_name}</strong> has updated the status of your project:</p>

                <div class="status-card">
                    <h2>{project_title}</h2>
                    <div class="status-change">
                        <span style="color: #737373;">{old_status}</span>
                        <span>→</span>
                        <span style="color: #000000; font-weight: 600;">{new_status}</span>
                    </div>
                </div>

                <p>View your project for more details and any additional updates from your agent.</p>

                <div style="text-align: center;">
                    <a href="{self.frontend_url}/candidate-projects/{project_id}" class="button">View Project</a>
                </div>

                <p>Best regards,<br>
                <strong>The Remote-Works Team</strong></p>
            </div>

            <div class="footer">
                <p>You're receiving this email because your project status changed on Remote-Works.</p>
                <p>&copy; 2024 Remote-Works. All rights reserved.</p>
            </div>
        </body>
        </html>
        """

        text_content = f"""
        Project Status Changed: {project_title}

        Hi {candidate_name},

        Your agent {agent_name} has updated the status of your project: {project_title}

        Status changed from {old_status} to {new_status}

        View your project at: {self.frontend_url}/candidate-projects/{project_id}

        Best regards,
        The Remote-Works Team
        """

        return self._send_email(candidate_email, candidate_name, subject, html_content, text_content)


# Singleton instance
email_service = EmailService()
