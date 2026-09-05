package com.blockid.platform.config;

import com.blockid.platform.config.JwtTokenUtil;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import com.blockid.platform.model.User;
import com.blockid.platform.service.UserService;
import java.util.Optional;
import java.io.IOException;

@Component
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    @Autowired
    private JwtTokenUtil jwtUtil;

    @Autowired
    @Lazy
    private UserService userService;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");

        Optional<User> userOpt = userService.findByEmail(email);
        User user;
        if (userOpt.isEmpty()) {
            user = new User();
            user.setEmail(email);
            user.setName(name != null ? name : "Google User");
            // Dummy password for Google users before hashing
            user.setPassword(java.util.UUID.randomUUID().toString());
            user.setRole(com.blockid.platform.model.Role.USER);
            user.setStatus("NONE");
            user = userService.registerUser(user);
        } else {
            user = userOpt.get();
            // Patch existing OAuth users who didn't get a DID on their first login
            if (user.getDid() == null) {
                String didSuffix = String.format("%06d", (int) (Math.random() * 1000000));
                user.setDid("BID-2024-" + didSuffix);
                user = userService.save(user);
            }
        }

        // Generate JWT token for the user
        String token = jwtUtil.generateToken(email);

        // Safely construct user JSON string to pass back to frontend (Vite port 8443)
        String userJson = String.format(
                "{\"id\":%d,\"name\":\"%s\",\"email\":\"%s\",\"role\":\"%s\",\"status\":\"%s\",\"phone\":\"%s\",\"country\":\"%s\",\"did\":\"%s\"}",
                user.getId(),
                user.getName().replace("\"", "'"),
                user.getEmail(),
                user.getRole().name().toLowerCase(),
                user.getStatus() != null ? user.getStatus() : "",
                user.getPhone() != null ? user.getPhone() : "",
                user.getCountry() != null ? user.getCountry() : "",
                user.getDid() != null ? user.getDid() : "");

        String encodedUser = java.net.URLEncoder.encode(userJson, "UTF-8");
        String frontendUrl = "http://localhost:8443/login?token=" + token + "&user=" + encodedUser;
        getRedirectStrategy().sendRedirect(request, response, frontendUrl);
    }
}
