from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


def send_welcome_email(user):
    """
    Send a welcome email to the newly registered user.
    
    Args:
        user: The User instance that just registered
    """
    subject = 'Welcome to AI Job Portal!'
    
    # Create email content
    html_message = f"""
    <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
            <h2 style="color: #007bff;">Welcome to AI Job Portal!</h2>
            <p>Hi <strong>{user.first_name or user.username}</strong>,</p>
            <p>Thank you for registering with <strong>AI Job Portal</strong>!</p>
            <p>Your account has been successfully created with the following details:</p>
            <ul>
                <li><strong>Username:</strong> {user.username}</li>
                <li><strong>Email:</strong> {user.email}</li>
                <li><strong>Role:</strong> {user.get_role_display()}</li>
            </ul>
            <p>You can now log in and start exploring opportunities that match your profile.</p>
            <p>If you have any questions, feel free to contact our support team.</p>
            <p style="margin-top: 30px; color: #777; font-size: 12px;">
                <em>This is an automated email. Please do not reply to this email.</em>
            </p>
            <p style="color: #777; font-size: 12px;">
                © 2024 AI Job Portal. All rights reserved.
            </p>
        </body>
    </html>
    """
    
    plain_message = strip_tags(html_message)
    
    # Debug output
    print(f"\n{'='*60}")
    print(f"EMAIL SERVICE: Attempting to send welcome email to {user.email}")
    print(f"Email Backend: {settings.EMAIL_BACKEND}")
    print(f"{'='*60}\n")
    
    try:
        logger.info(f"Sending welcome email to {user.email}")
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message=html_message,
            fail_silently=False,
        )
        logger.info(f"Welcome email sent successfully to {user.email}")
        return True
    except Exception as e:
        logger.error(f"Error sending welcome email to {user.email}: {str(e)}", exc_info=True)
        return False
