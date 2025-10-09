# Email Configuration Setup

## Overview
The support form sends emails from `sadhwanijosue35@outlook.com` to `sadhwanijosue35@outlook.com`.

## Configuration

### 1. Set Email Password

You need to set the email password as an environment variable for security:

#### On macOS/Linux:
```bash
export EMAIL_PASSWORD="your-outlook-password"
```

#### On Windows (PowerShell):
```powershell
$env:EMAIL_PASSWORD="your-outlook-password"
```

### 2. Outlook Account Settings

For Outlook/Hotmail accounts, you may need to:

1. **Enable SMTP Authentication**
   - Go to Outlook settings
   - Enable "Let devices and apps use POP" or similar option

2. **Use App Password** (Recommended)
   - If you have 2FA enabled, create an app-specific password
   - Go to: https://account.microsoft.com/security
   - Click "Advanced security options"
   - Under "App passwords", generate a new password
   - Use this app password instead of your regular password

### 3. Alternative Configuration

If you want to use different email settings, update `application.yml`:

```yaml
email:
  smtp:
    host: smtp-mail.outlook.com  # Change for other providers
    port: 587
  username: your-email@outlook.com
  password: ${EMAIL_PASSWORD:}
  from: your-email@outlook.com
  to: recipient@outlook.com
```

## Testing

1. Start the backend service:
```bash
cd backend-service
mvn spring-boot:run
```

2. Start the frontend:
```bash
cd cloud-ui
npm start
```

3. Navigate to the Support page and submit a test form

## Common SMTP Settings

- **Gmail**: smtp.gmail.com:587 (requires app password)
- **Outlook/Hotmail**: smtp-mail.outlook.com:587
- **Yahoo**: smtp.mail.yahoo.com:587
- **Office 365**: smtp.office365.com:587

## Troubleshooting

1. **Authentication Failed**: Check password and username
2. **Connection Timeout**: Verify SMTP host and port
3. **TLS Error**: Ensure TLS 1.2 is supported
4. **Blocked**: Check if your email provider blocks SMTP access

