package com.cloudsecure.backend.util;

import org.jasypt.encryption.pbe.PooledPBEStringEncryptor;
import org.jasypt.encryption.pbe.config.SimpleStringPBEConfig;

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

    public static void main(String[] args) {
        // Use this to encrypt your email password
        String masterPassword = "CloudSecureAI2025DefaultKey";
        String emailPassword = "ozxamjyqxlvqejgo"; // Your Gmail app password
        
        String encrypted = encrypt(emailPassword, masterPassword);
        System.out.println("==============================================");
        System.out.println("ENCRYPTED EMAIL PASSWORD:");
        System.out.println(encrypted);
        System.out.println("==============================================");
        System.out.println("\nAdd this to your application.yml:");
        System.out.println("email:");
        System.out.println("  password: ENC(" + encrypted + ")");
        System.out.println("==============================================");
        
        // Verify it can be decrypted
        String decrypted = decrypt(encrypted, masterPassword);
        System.out.println("\nVerification - Decrypted matches original: " + emailPassword.equals(decrypted));
    }
}

