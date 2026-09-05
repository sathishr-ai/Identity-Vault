package com.blockid.platform.controller;

import com.blockid.platform.config.JwtTokenUtil;
import com.blockid.platform.model.Role;
import com.blockid.platform.model.User;
import com.blockid.platform.repository.UserRepository;
import com.blockid.platform.service.CustomUserDetailsService;
import com.blockid.platform.service.UserService;
import com.blockid.platform.service.AuditLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/auth")

public class AuthController {

    @Autowired
    private com.blockid.platform.controller.AdminController adminController;

    @GetMapping("/debug-approve/{userId}")
    public ResponseEntity<?> debugApprove(@PathVariable("userId") Long userId) {
        try {
            return adminController.approveIdentity(userId, null);
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("message", "CRASH: " + e.getMessage(), "cause", String.valueOf(e.getCause())));
        }
    }

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Autowired
    private UserService userService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private com.blockid.platform.service.EmailNotificationService emailNotificationService;

    // In-memory maps for active OTPs and pending registrations with timestamps
    private final Map<String, String> otpStore = new java.util.concurrent.ConcurrentHashMap<>();
    private final Map<String, Long> otpTimestamps = new java.util.concurrent.ConcurrentHashMap<>();

    private final Map<String, User> pendingRegistrations = new java.util.concurrent.ConcurrentHashMap<>();
    private final Map<String, Long> pendingTimestamps = new java.util.concurrent.ConcurrentHashMap<>();

    // Rate Limiting Map
    private final Map<String, Long> rateLimiter = new java.util.concurrent.ConcurrentHashMap<>();

    private void cleanupExpiredData() {
        long now = System.currentTimeMillis();
        long expiryLimit = 15 * 60 * 1000; // 15 mins
        otpTimestamps.entrySet().removeIf(entry -> {
            if (now - entry.getValue() > expiryLimit) {
                otpStore.remove(entry.getKey());
                return true;
            }
            return false;
        });
        pendingTimestamps.entrySet().removeIf(entry -> {
            if (now - entry.getValue() > expiryLimit) {
                pendingRegistrations.remove(entry.getKey());
                return true;
            }
            return false;
        });
        rateLimiter.entrySet().removeIf(entry -> now - entry.getValue() > 60 * 1000); // 1-minute global rate limit
                                                                                      // cleanup
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String loginId = request.get("email");
        String password = request.get("password");

        if (loginId == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email/Phone and Password are required."));
        }

        Optional<User> userOpt;
        if (loginId.contains("@")) {
            userOpt = userService.findByEmail(loginId);
        } else {
            java.util.List<User> users = userRepository.findByPhone(loginId);
            userOpt = users.isEmpty() ? Optional.empty() : Optional.of(users.get(0));
        }

        if (userOpt.isEmpty() || !passwordEncoder.matches(password, userOpt.get().getPassword())) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid email, mobile number, or password."));
        }
        User user = userOpt.get();
        if ("suspended".equalsIgnoreCase(user.getStatus())) {
            return ResponseEntity.status(403).body(Map.of("message",
                    "Your account has been temporarily blocked due to security concerns or fraudulent documentation."));
        }

        user.setLastLogin(java.time.LocalDateTime.now());
        userService.save(user);
        final UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        final String token = jwtTokenUtil.generateToken(userDetails, user.getRole().name());

        auditLogService.log(
                "Logged In Successfully",
                user.getName(),
                "System Session",
                "info",
                "Auth");

        return ResponseEntity.ok(Map.of(
                "token", token,
                "user", Map.of(
                        "id", user.getId(),
                        "name", user.getName(),
                        "email", user.getEmail(),
                        "role", user.getRole().name().toLowerCase(),
                        "phone", user.getPhone() != null ? user.getPhone() : "",
                        "country", user.getCountry() != null ? user.getCountry() : "",
                        "did", user.getDid() != null ? user.getDid() : "",
                        "status", user.getStatus())));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otpCode = request.get("otp");

        if (email == null || otpCode == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email and OTP are required."));
        }

        cleanupExpiredData();
        String storedOtp = otpStore.get(email);
        if (storedOtp == null || !storedOtp.equals(otpCode)) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid or expired OTP code."));
        }

        // OTP is verified, generate the JWT token
        User user = null;
        if (pendingRegistrations.containsKey(email)) {
            try {
                user = userService.registerUser(pendingRegistrations.get(email));
                pendingRegistrations.remove(email);
            } catch (Exception e) {
                return ResponseEntity.badRequest().body(Map.of("message", "Registration failed: " + e.getMessage()));
            }
        }

        if (user == null) {
            Optional<User> userOpt = userService.findByEmail(email);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("message", "User not found."));
            }
            user = userOpt.get();
        }
        if ("suspended".equalsIgnoreCase(user.getStatus())) {
            return ResponseEntity.status(403).body(Map.of("message",
                    "Your account has been temporarily blocked due to security concerns or fraudulent documentation."));
        }

        final UserDetails userDetails = userDetailsService.loadUserByUsername(email);
        final String token = jwtTokenUtil.generateToken(userDetails, user.getRole().name());

        otpStore.remove(email); // clean up token

        auditLogService.log(
                "Logged In Successfully",
                user.getName(),
                "System Session",
                "info",
                "Auth");

        return ResponseEntity.ok(Map.of(
                "token", token,
                "user", Map.of(
                        "id", user.getId(),
                        "name", user.getName(),
                        "email", user.getEmail(),
                        "role", user.getRole().name().toLowerCase(),
                        "phone", user.getPhone() != null ? user.getPhone() : "",
                        "country", user.getCountry() != null ? user.getCountry() : "",
                        "did", user.getDid() != null ? user.getDid() : "",
                        "status", user.getStatus())));
    }

    @PostMapping("/check")
    public ResponseEntity<?> checkUser(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String phone = request.get("phone");

        if (email != null && userRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "This email is already registered."));
        }
        if (phone != null && !phone.trim().isEmpty() && !userRepository.findByPhone(phone).isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "This mobile number is already registered."));
        }
        return ResponseEntity.ok(Map.of("message", "Available"));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> request) {
        String name = request.get("name");
        String email = request.get("email");
        String phone = request.get("phone");
        String country = request.get("country");
        String password = request.get("password");
        String roleStr = request.get("role");

        if (name == null || email == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Missing required fields."));
        }

        Role role = Role.USER;
        if (roleStr != null) {
            try {
                role = Role.valueOf(roleStr.toUpperCase());
            } catch (Exception e) {
                return ResponseEntity.badRequest().body(Map.of("message", "Invalid account role."));
            }
        }

        cleanupExpiredData();
        long now = System.currentTimeMillis();
        if (rateLimiter.containsKey(email) && (now - rateLimiter.get(email) < 45 * 1000)) {
            return ResponseEntity.status(429)
                    .body(Map.of("message", "Too many requests. Please wait before retrying."));
        }
        rateLimiter.put(email, now);

        if (userRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "This email is already registered."));
        }

        if (phone != null && !phone.trim().isEmpty() && !userRepository.findByPhone(phone).isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "This mobile number is already registered."));
        }

        User user = new User(email, password, name, phone, country, role);
        pendingRegistrations.put(email, user);
        pendingTimestamps.put(email, now);

        try {
            String otp = String.format("%06d", (int) (Math.random() * 1000000));
            otpStore.put(email, otp);
            otpTimestamps.put(email, now);

            // Call native Java Email Service asynchronously
            try {
                emailNotificationService.sendOtpEmail(email, otp, "register");
            } catch (Exception e) {
                System.err.println("Failed to execute native Java Mail service: " + e.getMessage());
            }

            return ResponseEntity.ok(
                    Map.of("message", "Registration successful. Complete MFA setup.", "email", email));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is required."));
        }

        cleanupExpiredData();
        long now = System.currentTimeMillis();
        if (rateLimiter.containsKey(email) && (now - rateLimiter.get(email) < 45 * 1000)) {
            return ResponseEntity.status(429).body(Map.of("message", "Too many requests. Please wait."));
        }
        rateLimiter.put(email, now);

        Optional<User> userOpt = userService.findByEmail(email);
        if (userOpt.isEmpty()) {
            // For security, don't tell the user the email doesn't exist.
            return ResponseEntity.ok(Map.of("message", "If the email exists, a password reset link has been sent."));
        }

        // Generate a 6-digit random code
        String resetToken = String.format("%06d", (int) (Math.random() * 1000000));
        otpStore.put(email, resetToken);
        otpTimestamps.put(email, now);

        // Call native Java Email Service asynchronously
        try {
            emailNotificationService.sendOtpEmail(email, resetToken, "reset");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", "Failed to send native password reset email."));
        }

        return ResponseEntity.ok(Map.of("message", "Password reset code sent to your registered email address."));
    }

    @PostMapping("/verify-reset-otp")
    public ResponseEntity<?> verifyResetOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");

        if (email == null || otp == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email and OTP are required."));
        }

        String storedOtp = otpStore.get(email);
        if (storedOtp == null || !storedOtp.equals(otp)) {
            return ResponseEntity.status(401).body(Map.of("message", "Incorrect OTP."));
        }

        return ResponseEntity.ok(Map.of("message", "OTP verified successfully."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");
        String newPassword = request.get("newPassword");

        if (email == null || otp == null || newPassword == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email, OTP, and new password are required."));
        }

        String storedOtp = otpStore.get(email);
        if (storedOtp == null || !storedOtp.equals(otp)) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid or expired reset code."));
        }

        Optional<User> userOpt = userService.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("message", "User not found."));
        }

        User user = userOpt.get();
        // Securely hash the new password natively in Java
        user.setPassword(passwordEncoder.encode(newPassword));

        userRepository.save(user);
        otpStore.remove(email);

        return ResponseEntity.ok(Map.of("message", "Password successfully reset. You can now login."));
    }

    // --- MODULE 1: Session Management ---
    @PostMapping("/revoke-session")
    public ResponseEntity<?> revokeSession(
            @RequestHeader(value = "Authorization", required = false) String tokenHeader) {
        if (tokenHeader != null && tokenHeader.startsWith("Bearer ")) {
            String token = tokenHeader.substring(7);
            jwtTokenUtil.blacklistToken(token); // Execute Zero-Trust Kill Switch
            return ResponseEntity.ok(Map.of("message", "Session forcefully revoked. Device permanently blocked."));
        }
        return ResponseEntity.badRequest().body(Map.of("message", "No active session token provided."));
    }
}
