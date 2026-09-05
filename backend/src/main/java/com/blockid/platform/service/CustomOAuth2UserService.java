package com.blockid.platform.service;

import com.blockid.platform.model.Role;
import com.blockid.platform.model.User;
import com.blockid.platform.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");

        Optional<User> userOptional = userRepository.findByEmail(email);

        if (userOptional.isEmpty()) {
            User user = new User();
            user.setEmail(email);
            user.setName(name);
            user.setRole(Role.USER);
            user.setStatus("APPROVED"); // Auto-approve Google users
            user.setJoinDate(LocalDateTime.now());
            user.setPassword("OAUTH2_USER"); // Placeholder since they login via Google
            userRepository.save(user);
        }

        return oAuth2User;
    }
}
