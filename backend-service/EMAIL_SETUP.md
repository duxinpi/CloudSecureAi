# Email Configuration Setup

## Overview
The support form sends emails from `sadhwanijosue35@outlook.com` to `sadhwanijosue35@outlook.com`.

## ⚠️ IMPORTANT: Email Password Required

**The email functionality will NOT work without setting the EMAIL_PASSWORD environment variable.**

## Quick Setup

### 1. Set Email Password

You need to set the email password as an environment variable for security:

#### On macOS/Linux:
```bash
export EMAIL_PASSWORD="your-outlook-password-or-app-password"
```

Then restart your backend server:
```bash
cd backend-service
mvn spring-boot:run
```

#### On Windows (PowerShell):
```powershell
$env:EMAIL_PASSWORD="your-outlook-password-or-app-password"
```

Then restart your backend server:
```powershell
cd backend-service
mvn spring-boot:run
```

### 2. Verify Configuration

After starting the backend, check the logs for:
- "Email password is not configured" = **PASSWORD NOT SET** ❌
- "Attempting to send support email" = **PASSWORD IS SET** ✅

### 3. Outlook Account Settings

For Outlook/Hotmail accounts, you **MUST** do one of the following:

#### Option A: Use App Password (Recommended if 2FA enabled)
1. Go to: https://account.microsoft.com/security
2. Click "Advanced security options"
3. Scroll to "App passwords"
4. Click "Create a new app password"
5. Copy the generated password
6. Use this password as your EMAIL_PASSWORD

#### Option B: Enable Less Secure App Access (if no 2FA)
1. Go to Outlook account settings
2. Enable "Let devices and apps use POP" or similar option
3. Use your regular password as EMAIL_PASSWORD

**Note:** If you get authentication errors, you MUST use an app password.

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

### Common Errors and Solutions

1. **"Email password is not configured"**
   - Solution: Set EMAIL_PASSWORD environment variable and restart backend

2. **"Authentication Failed"**
   - Solution: Use an app password instead of your regular password
   - Go to https://account.microsoft.com/security to create one

3. **"Connection Timeout"**
   - Solution: Check firewall settings, verify SMTP host and port

4. **"TLS Error"**
   - Solution: Ensure your Java version supports TLS 1.2

5. **No error but email not received**
   - Check spam/junk folder
   - Verify the recipient email address in application.yml
   - Check backend logs for detailed SMTP debug output

### Viewing Logs

Check the backend console output for detailed email sending logs:
- Look for: "Attempting to send support email"
- Look for: "Email sent successfully"
- SMTP debug output will show connection details

