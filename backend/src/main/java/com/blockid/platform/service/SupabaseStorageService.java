package com.blockid.platform.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class SupabaseStorageService {

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.key}")
    private String supabaseKey;

    @Value("${supabase.bucket}")
    private String bucketName;

    private final RestTemplate restTemplate = new RestTemplate();

    public String uploadDocument(MultipartFile file, String userId) throws IOException {
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null && originalFilename.contains(".")
                ? originalFilename.substring(originalFilename.lastIndexOf("."))
                : "";
        String uniqueFilename = userId + "_" + UUID.randomUUID() + extension;

        // Validation for secure file upload: check content types
        String contentType = file.getContentType();
        if (contentType == null || (!contentType.equals("application/pdf") &&
                !contentType.equals("image/jpeg") &&
                !contentType.equals("image/png") &&
                !contentType.equals("image/jpg"))) {
            throw new IllegalArgumentException("Invalid file type. Only PDF, JPG, PNG are supported.");
        }

        // If credentials are not placeholder, attempt to upload to Supabase Storage
        if (supabaseUrl != null && !supabaseUrl.contains("placeholder-project") &&
                supabaseKey != null && !supabaseKey.contains("placeholder-key")) {
            try {
                String uploadUrl = supabaseUrl + "/storage/v1/object/" + bucketName + "/" + uniqueFilename;

                HttpHeaders headers = new HttpHeaders();
                headers.set("Authorization", "Bearer " + supabaseKey);
                headers.set("apikey", supabaseKey);
                headers.setContentType(MediaType.valueOf(file.getContentType()));

                HttpEntity<byte[]> requestEntity = new HttpEntity<>(file.getBytes(), headers);

                ResponseEntity<String> response = restTemplate.exchange(
                        uploadUrl, HttpMethod.POST, requestEntity, String.class);

                if (response.getStatusCode().is2xxSuccessful()) {
                    // Return public url
                    return supabaseUrl + "/storage/v1/object/public/" + bucketName + "/" + uniqueFilename;
                }
            } catch (Exception e) {
                System.err.println("Supabase upload failed, falling back to local storage: " + e.getMessage());
            }
        }

        // Fallback to storing locally (makes application robust and runnable without
        // configuration)
        String uploadDir = "uploads";
        File dir = new File(uploadDir);
        if (!dir.exists()) {
            dir.mkdirs();
        }

        Path path = Paths.get(uploadDir, uniqueFilename);
        Files.write(path, file.getBytes());

        // Return a mockable local API address that serves the file, or a placeholder
        // loop
        return "/api/v1/documents/view/" + uniqueFilename;
    }
}
