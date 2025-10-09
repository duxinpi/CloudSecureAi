# Email Configuration Setup

## Overview
The support form sends emails from `waynegone299@gmail.com` to `waynegone299@gmail.com`.

## ⚠️ IMPORTANT: Email Password Required

**The email functionality will NOT work without setting the EMAIL_PASSWORD environment variable.**

## Quick Setup

### 1. Set Email Password

You need to set the email password as an environment variable for security:

#### On macOS/Linux:
```bash
export EMAIL_PASSWORD="your-gmail-app-password"
```

Then restart your backend server:
```bash
cd backend-service
mvn spring-boot:run
```

#### On Windows (PowerShell):
```powershell
$env:EMAIL_PASSWORD="your-gmail-app-password"
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

### 3. Gmail Account Settings

For Gmail accounts, you **MUST** use an App Password:

#### Create Gmail App Password:
1. Go to: https://myaccount.google.com/security
2. Sign in with `waynegone299@gmail.com`
3. Enable "2-Step Verification" if not already enabled
4. Go to: https://myaccount.google.com/apppasswords
5. Click "Select app" → Choose "Mail"
6. Click "Select device" → Choose "Other (Custom name)"
7. Enter "CloudSecureAI" as the name
8. Click "Generate"
9. Copy the 16-character app password (format: xxxx xxxx xxxx xxxx)
10. Use this password as your EMAIL_PASSWORD

**Note:** You cannot use your regular Gmail password. You MUST use an app password.

### 3. Alternative Configuration

If you want to use different email settings, update `application.yml`:

```yaml
email:
  smtp:
    host: smtp.gmail.com  # Change for other providers
    port: 587
  username: your-email@gmail.com
  password: ${EMAIL_PASSWORD:}
  from: your-email@gmail.com
  to: recipient@gmail.com
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
   - Solution: Use a Gmail app password instead of your regular password
   - Go to https://myaccount.google.com/apppasswords to create one

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

