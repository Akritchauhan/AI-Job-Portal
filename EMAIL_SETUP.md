# Email System Implementation Guide

## Overview
An email notification system has been added to send welcome emails to users upon successful registration.

## Files Modified/Created

### 1. **settings.py** - Email Configuration
- Added email backend configuration
- **Development (DEBUG=True)**: Uses Console Backend (prints emails to console)
- **Production (DEBUG=False)**: Configured for Gmail SMTP

### 2. **email_service.py** - Email Service (NEW FILE)
- `send_welcome_email(user)` function
- Sends HTML formatted welcome email with user details
- Includes error handling and logging

### 3. **serializers.py** - User Registration
- Added `email`, `first_name`, `last_name` fields
- Added email and username uniqueness validation
- Calls email service on user creation

### 4. **views.py** - Registration Endpoint
- Updated response message with confirmation
- Now returns 201 CREATED status
- Includes email confirmation message

## Setup Instructions

### For Development (Testing)
By default, the system uses Console Backend which prints emails to the terminal.

1. **Registration Request Format:**
```json
POST /api/register/
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "role": "student",
  "first_name": "John",
  "last_name": "Doe"
}
```

2. **Check Console Output:**
   - Welcome email content will be printed in the Django console
   - No actual email will be sent

### For Production (Gmail Setup)

1. **Create a Gmail App Password:**
   - Go to myaccount.google.com
   - Enable 2-Factor Authentication
   - Generate an App Password for "Mail" and "Windows Computer"
   - Copy the 16-character app password

2. **Update settings.py:**
```python
EMAIL_HOST_USER = 'your-email@gmail.com'
EMAIL_HOST_PASSWORD = 'your-16-char-app-password'
```

3. **Test the Configuration:**
   - Register a new user
   - Check if email is received in the recipient's inbox

### For Other Email Providers

Update `settings.py` with your provider's SMTP details:
```python
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.your-provider.com'  # e.g., smtp.sendgrid.net
EMAIL_PORT = 587  # or 465 for SSL
EMAIL_USE_TLS = True  # or False if using SSL
EMAIL_HOST_USER = 'your-username'
EMAIL_HOST_PASSWORD = 'your-password'
```

## Email Template

The welcome email includes:
- Personalized greeting with user's first name
- Account confirmation with username and email
- User's assigned role
- Basic instructions
- Professional footer

## Response Examples

### Success (201 Created):
```json
{
  "msg": "User registered successfully!",
  "detail": "A welcome email has been sent to your registered email address."
}
```

### Validation Errors (400 Bad Request):
```json
{
  "email": ["This email is already registered."],
  "username": ["This username is already taken."]
}
```

## Testing

### Test Registration with cURL:
```bash
curl -X POST http://localhost:8000/api/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "testpass123",
    "role": "student",
    "first_name": "Test",
    "last_name": "User"
  }'
```

### Using Frontend:
Update your React registration form to include email field in the POST request to backend.

## Troubleshooting

### Emails not sending in production?
1. Check `DEBUG = False` in settings.py
2. Verify EMAIL_HOST_USER and EMAIL_HOST_PASSWORD
3. Check firewall/port 587 access
4. Review Django logs for exceptions

### Development console not showing emails?
1. Verify `DEBUG = True`
2. Check that EMAIL_BACKEND is set to `console.EmailBackend`
3. Restart Django development server

## Future Enhancements

Consider adding:
- Email verification with token before account activation
- Password reset emails
- Job application notifications
- Interview/offer emails
- Email templates in database for easy management
