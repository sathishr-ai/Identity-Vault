package com.blockid.platform.service;

import com.blockid.platform.model.User;
import com.blockid.platform.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuditLogService auditLogService;

    public User registerUser(User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already registered: " + user.getEmail());
        }

        if (user.getPhone() != null && !user.getPhone().trim().isEmpty()) {
            if (!userRepository.findByPhone(user.getPhone()).isEmpty()) {
                throw new IllegalArgumentException("Phone number already registered: " + user.getPhone());
            }
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));

        // Generate placeholder DID on registration (admins will verify it later)
        String didSuffix = String.format("%06d", (int) (Math.random() * 1000000));
        user.setDid("BID-2024-" + didSuffix);
        user.setStatus("NONE"); // Default no verification submitted

        User savedUser = userRepository.save(user);

        auditLogService.log(
                "User Registered",
                user.getName(),
                user.getEmail(),
                "info",
                "Auth");

        return savedUser;
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    public User save(User user) {
        return userRepository.save(user);
    }
}
