package com.cloudsecure.backend.util;

import org.jasypt.encryption.pbe.PooledPBEStringEncryptor;
import org.jasypt.encryption.pbe.config.SimpleStringPBEConfig;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

/**
 * Utility class for encrypting sensitive data like passwords
 * Run this class to encrypt your email password
 */
public class EncryptionUtil {

    public static String encrypt(String plainText, String masterPassword) {
        PooledPBEStringEncryptor encryptor = new PooledPBEStringEncryptor();
        SimpleStringPBEConfig config = new SimpleStringPBEConfig();
        
        config.setPassword(masterPassword);
        config.setAlgorithm("PBEWithMD5AndDES");
        config.setKeyObtentionIterations("1000");
        config.setPoolSize("1");
        config.setProviderName("SunJCE");
        config.setSaltGeneratorClassName("org.jasypt.salt.RandomSaltGenerator");
        config.setStringOutputType("base64");
        
        encryptor.setConfig(config);
        return encryptor.encrypt(plainText);
    }

    public static String decrypt(String encryptedText, String masterPassword) {
        PooledPBEStringEncryptor encryptor = new PooledPBEStringEncryptor();
        SimpleStringPBEConfig config = new SimpleStringPBEConfig();
        
        config.setPassword(masterPassword);
        config.setAlgorithm("PBEWithMD5AndDES");
        config.setKeyObtentionIterations("1000");
        config.setPoolSize("1");
        config.setProviderName("SunJCE");
        config.setSaltGeneratorClassName("org.jasypt.salt.RandomSaltGenerator");
        config.setStringOutputType("base64");
        
        encryptor.setConfig(config);
        return encryptor.decrypt(encryptedText);
    }

    /**
     * Load encrypted password from secure.properties file
     */
    private static String loadEncryptedPasswordFromFile() {
        Properties props = new Properties();
        try {
            // Try to load from classpath
            InputStream input = EncryptionUtil.class.getClassLoader()
                .getResourceAsStream("secure.properties");
            
            if (input == null) {
                // Try file system path
                input = new FileInputStream("src/main/resources/secure.properties");
            }
            
            props.load(input);
            input.close();
            
            return props.getProperty("email.app.password.encrypted");
        } catch (IOException e) {
            System.err.println("Error loading secure.properties: " + e.getMessage());
            return null;
        }
    }

    /**
     * Load master encryption key from secure.properties or environment variable
     */
    private static String loadMasterKey() {
        // First, check environment variable
        String envKey = System.getenv("JASYPT_ENCRYPTOR_PASSWORD");
        if (envKey != null && !envKey.trim().isEmpty()) {
            return envKey;
        }
        
        // Otherwise, load from secure.properties
        Properties props = new Properties();
        try {
            InputStream input = EncryptionUtil.class.getClassLoader()
                .getResourceAsStream("secure.properties");
            
            if (input == null) {
                input = new FileInputStream("src/main/resources/secure.properties");
            }
            
            props.load(input);
            input.close();
            
            String key = props.getProperty("jasypt.master.key");
            return key != null ? key : "CloudSecureAI2025DefaultKey";
        } catch (IOException e) {
            System.err.println("Error loading master key: " + e.getMessage());
            return "CloudSecureAI2025DefaultKey";
        }
    }

    public static void main(String[] args) {
        System.out.println("==============================================");
        System.out.println("     CloudSecureAI - Email Password Tool");
        System.out.println("==============================================\n");
        
        // Load master key
        String masterPassword = loadMasterKey();
        System.out.println("✅ Master key loaded: " + (System.getenv("JASYPT_ENCRYPTOR_PASSWORD") != null ? "From environment" : "From secure.properties"));
        
        // Load encrypted password from file
        String encryptedPassword = loadEncryptedPasswordFromFile();
        
        if (encryptedPassword == null) {
            System.out.println("❌ ERROR: Could not load encrypted password from secure.properties");
            System.out.println("\nTo encrypt a new password:");
            System.out.println("1. Update this main method with your Gmail app password");
            System.out.println("2. Run this utility to get encrypted value");
            System.out.println("3. Update secure.properties with encrypted value");
            return;
        }
        
        System.out.println("✅ Encrypted password loaded from secure.properties");
        System.out.println("\nEncrypted value:");
        System.out.println("  " + encryptedPassword);
        
        // Decrypt and verify
        try {
            String decrypted = decrypt(encryptedPassword, masterPassword);
            System.out.println("\n✅ Successfully decrypted password");
            System.out.println("   Password length: " + decrypted.length() + " characters");
            System.out.println("\n==============================================");
            System.out.println("✅ Email password configuration is VALID");
            System.out.println("==============================================");
        } catch (Exception e) {
            System.out.println("\n❌ ERROR: Failed to decrypt password");
            System.out.println("   " + e.getMessage());
            System.out.println("\nPossible issues:");
            System.out.println("- Master key may have changed");
            System.out.println("- Encrypted password may be corrupted");
        }
        
        // If args provided, encrypt new password
        if (args.length > 0) {
            System.out.println("\n\n==============================================");
            System.out.println("     Encrypting New Password");
            System.out.println("==============================================");
            String newPassword = args[0];
            String encrypted = encrypt(newPassword, masterPassword);
            System.out.println("\nNew Encrypted Password:");
            System.out.println("  " + encrypted);
            System.out.println("\nUpdate secure.properties with:");
            System.out.println("  email.app.password.encrypted=" + encrypted);
            System.out.println("\nUpdate application.yml with:");
            System.out.println("  password: ENC(" + encrypted + ")");
            System.out.println("==============================================");
        }
    }
}

