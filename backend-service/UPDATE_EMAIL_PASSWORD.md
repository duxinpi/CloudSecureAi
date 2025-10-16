# How to Update Email Password

The email password is encrypted and stored in both:
- `src/main/resources/secure.properties` - Encrypted password storage
- `src/main/resources/application.yml` - Used by the application

To update the password:

## Step 1: Get Gmail App Password

1. Go to: https://myaccount.google.com/security
2. Sign in with `waynegone299@gmail.com`
3. Enable "2-Step Verification" if not already enabled
4. Go to: https://myaccount.google.com/apppasswords
5. Create a new app password for "CloudSecureAI"
6. Copy the 16-character password (remove spaces)
   - Example: `abcd efgh ijkl mnop` → `abcdefghijklmnop`

## Step 2: Encrypt the New Password

Run this command to encrypt your Gmail app password:

```bash
cd backend-service

# Replace YOUR_GMAIL_APP_PASSWORD with the actual password from Step 1
mvn compile && mvn exec:java \
  -Dexec.mainClass="com.cloudsecure.backend.util.EncryptionUtil" \
  -Dexec.args="YOUR_GMAIL_APP_PASSWORD" \
  -Dexec.classpathScope=compile
```

This will output the encrypted password.

## Step 3: Update Configuration Files

Copy the encrypted output and update **BOTH** files:

**File 1: `src/main/resources/secure.properties`**
```properties
email.app.password.encrypted=your-encrypted-password-here
```

**File 2: `src/main/resources/application.yml`**
```yaml
email:
  password: ENC(your-encrypted-password-here)
```

## Step 4: Restart Backend

```bash
cd backend-service
mvn spring-boot:run
```

## Security Notes

- **Master Password:** The default master password is `CloudSecureAI2025DefaultKey`
- **Custom Master Password:** Set `JASYPT_ENCRYPTOR_PASSWORD` environment variable for custom encryption key
- **Encrypted Password:** Safely stored in application.yml as `ENC(encrypted-value)`
- **No Plain Text:** Email password is never stored in plain text

## Current Configuration

- **Email Provider:** Gmail (smtp.gmail.com:587)
- **From/To:** waynegone299@gmail.com
- **Encryption:** Jasypt PBEWithMD5AndDES
- **Master Key:** CloudSecureAI2025DefaultKey (default) or JASYPT_ENCRYPTOR_PASSWORD (custom)
- **Encrypted Storage:** `src/main/resources/secure.properties`
- **Current Encrypted Password:** `h9mp4z0GgMJr4Q5acPNWXC7m56n27QAFS/Qak5VXzdg=`

## Verify Configuration

To verify your encrypted password is valid:

```bash
cd backend-service
mvn compile && mvn exec:java -Dexec.mainClass="com.cloudsecure.backend.util.EncryptionUtil"
```

You should see: `✅ Email password configuration is VALID`

