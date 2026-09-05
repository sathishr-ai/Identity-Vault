package com.blockid.platform.service;

import org.springframework.stereotype.Service;
import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import java.security.*;
import java.util.Base64;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class CryptoService {

    // We simulate a highly secure Key Management System (KMS) in-memory
    // to strictly prevent breaking your existing PostgreSQL database schema.
    private final Map<String, KeyPair> userKeyPairs = new ConcurrentHashMap<>();
    private final Map<String, SecretKey> userAesKeys = new ConcurrentHashMap<>();

    public CryptoService() {
        try {
            // Auto-generate a master Admin KeyPair to simulate the KMS initializing
            generateAndStoreKeyPair("ADMIN_MASTER");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    // --- MODULE 4: Cryptographic Key Management ---
    public void generateAndStoreKeyPair(String identifier) throws Exception {
        if (!userKeyPairs.containsKey(identifier)) {
            // 1. Generate RSA-1024 Asymmetric KeyPair (For Signatures, compressed for DB)
            KeyPairGenerator keyGen = KeyPairGenerator.getInstance("RSA");
            keyGen.initialize(1024);
            userKeyPairs.put(identifier, keyGen.generateKeyPair());

            // 2. Generate AES-256 Symmetric Key (For Hybrid Encryption)
            KeyGenerator aesGen = KeyGenerator.getInstance("AES");
            aesGen.init(256);
            userAesKeys.put(identifier, aesGen.generateKey());
        }
    }

    // --- MODULE 2: Hybrid Encryption Engine (AES + RSA) ---

    // Feature: RSA Secure Key Encryption (Encrypt AES Key with RSA Public Key)
    public String secureKeyEncryption(String identifier) throws Exception {
        generateAndStoreKeyPair(identifier);
        PublicKey publicKey = userKeyPairs.get(identifier).getPublic();
        SecretKey aesKey = userAesKeys.get(identifier);

        Cipher rsaCipher = Cipher.getInstance("RSA");
        rsaCipher.init(Cipher.ENCRYPT_MODE, publicKey);
        byte[] encryptedAesKey = rsaCipher.doFinal(aesKey.getEncoded());

        return Base64.getEncoder().encodeToString(encryptedAesKey);
    }

    // Feature: AES-256 Data Encryption
    public byte[] encryptDocument(String identifier, byte[] fileData) throws Exception {
        generateAndStoreKeyPair(identifier); // Guard to guarantee user has a live key
        SecretKey secretKey = userAesKeys.get(identifier);

        Cipher cipher = Cipher.getInstance("AES");
        cipher.init(Cipher.ENCRYPT_MODE, secretKey);
        return cipher.doFinal(fileData); // Returns mathematically scrambled bytes
    }

    public byte[] decryptDocument(String identifier, byte[] encryptedData) throws Exception {
        SecretKey secretKey = userAesKeys.get(identifier);
        if (secretKey == null)
            throw new SecurityException("CRITICAL STOP: Missing cryptographic keys for decryption.");

        Cipher cipher = Cipher.getInstance("AES");
        cipher.init(Cipher.DECRYPT_MODE, secretKey);
        return cipher.doFinal(encryptedData); // Unlocks via symmetric key
    }

    // --- MODULE 3 & 5: Immutable Digital Signatures (RSA) ---
    public String generateDigitalSignature(String identifier, String documentHash) throws Exception {
        generateAndStoreKeyPair(identifier);
        PrivateKey privateKey = userKeyPairs.get(identifier).getPrivate();

        // Sign the SHA-256 document hash instantly using the Admin's RSA Private Key
        Signature rsaSignature = Signature.getInstance("SHA256withRSA");
        rsaSignature.initSign(privateKey);
        rsaSignature.update(documentHash.getBytes());

        byte[] signatureBytes = rsaSignature.sign();
        return Base64.getEncoder().encodeToString(signatureBytes);
    }

    // --- Verifier Engine: Tamper Detection Routine ---
    public boolean verifyDigitalSignature(String identifier, String documentHash, String base64Signature) {
        try {
            if (!userKeyPairs.containsKey(identifier))
                return false;

            PublicKey publicKey = userKeyPairs.get(identifier).getPublic();

            Signature rsaSignature = Signature.getInstance("SHA256withRSA");
            rsaSignature.initVerify(publicKey);
            rsaSignature.update(documentHash.getBytes());

            byte[] signatureBytes = Base64.getDecoder().decode(base64Signature);

            // If the hash changed, or the signature isn't authentic, this will return FALSE
            // dynamically isolating the tamper
            return rsaSignature.verify(signatureBytes);
        } catch (Exception e) {
            return false; // Mathematical discrepancy triggered (Tampered)
        }
    }
}
