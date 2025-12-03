"""Email notification service using SendGrid"""
from typing import Optional
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Email, To, Content
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)


class EmailService:
    """Service for sending email notifications"""

    def __init__(self):
        """Initialize the email service with SendGrid API key"""
        self.api_key = settings.SENDGRID_API_KEY
        self.from_email = settings.FROM_EMAIL
        self.frontend_url = settings.FRONTEND_URL

    def _send_email(self, to_email: str, subject: str, html_content: str) -> bool:
        """
        Internal method to send email via SendGrid

        Args:
            to_email: Recipient email address
            subject: Email subject
            html_content: HTML content of the email

        Returns:
            True if email sent successfully, False otherwise
        """
        if not self.api_key:
            logger.warning("SendGrid API key not configured. Email not sent.")
            return False

        try:
            message = Mail(
                from_email=Email(self.from_email, "Remote-Works"),
                to_emails=To(to_email),
                subject=subject,
                html_content=Content("text/html", html_content)
            )

            sg = SendGridAPIClient(self.api_key)
            response = sg.send(message)

            if response.status_code in [200, 201, 202]:
                logger.info(f"Email sent successfully to {to_email}")
                return True
            else:
                logger.error(f"Failed to send email. Status code: {response.status_code}")
                return False

        except Exception as e:
            logger.error(f"Error sending email to {to_email}: {str(e)}")
            return False

    def send_project_created_notification(
        self,
        candidate_email: str,
        candidate_name: str,
        agent_name: str,
        project_title: str,
        project_description: str,
        project_id: int,
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

        return self._send_email(candidate_email, subject, html_content)

    def send_project_updated_notification(
        self,
        candidate_email: str,
        candidate_name: str,
        agent_name: str,
        project_title: str,
        project_id: int,
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

        return self._send_email(candidate_email, subject, html_content)

    def send_project_status_changed_notification(
        self,
        candidate_email: str,
        candidate_name: str,
        agent_name: str,
        project_title: str,
        project_id: int,
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

        return self._send_email(candidate_email, subject, html_content)


# Singleton instance
email_service = EmailService()
