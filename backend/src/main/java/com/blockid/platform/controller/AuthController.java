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
            return adminController.approveIdentity(userId);
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

    // In-memory simple map for active OTP codes: key is email, value is OTP
    private final Map<String, String> otpStore = new HashMap<>();

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");

        if (email == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email and Password are required."));
        }

        Optional<User> userOpt = userService.findByEmail(email);
        if (userOpt.isEmpty() || !passwordEncoder.matches(password, userOpt.get().getPassword())) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid email or password."));
        }
        User user = userOpt.get();
        user.setLastLogin(java.time.LocalDateTime.now());
        userService.save(user);
        final UserDetails userDetails = userDetailsService.loadUserByUsername(email);
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

        String storedOtp = otpStore.get(email);
        if (storedOtp == null || !storedOtp.equals(otpCode)) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid or expired OTP code."));
        }

        // OTP is verified, generate the JWT token
        Optional<User> userOpt = userService.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("message", "User not found."));
        }

        User user = userOpt.get();
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

        User user = new User(email, password, name, phone, country, role);

        try {
            User registered = userService.registerUser(user);
            otpStore.put(registered.getEmail(), "123456");
            System.out.println("Generated OTP for newly registered " + registered.getEmail() + ": 123456");
            return ResponseEntity.ok(
                    Map.of("message", "Registration successful. Complete MFA setup.", "email", registered.getEmail()));
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

        Optional<User> userOpt = userService.findByEmail(email);
        if (userOpt.isEmpty()) {
            // For security, don't tell the user the email doesn't exist.
            return ResponseEntity.ok(Map.of("message", "If the email exists, a password reset link has been sent."));
        }

        // Generate a 6-digit random code
        String resetToken = String.format("%06d", (int) (Math.random() * 1000000));
        otpStore.put(email, resetToken);

        // Run the Node.js script to send the email
        try {
            Process process = Runtime.getRuntime().exec(new String[] {
                    "node", "send_email.cjs", email, resetToken
            });
            process.waitFor();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", "Failed to send email."));
        }

        return ResponseEntity.ok(Map.of("message", "Password reset code sent to your registered email address."));
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
}
