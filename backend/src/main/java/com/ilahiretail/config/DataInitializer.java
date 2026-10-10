package com.ilahiretail.config;

import com.ilahiretail.entity.Role;
import com.ilahiretail.entity.User;
import com.ilahiretail.repository.RoleRepository;
import com.ilahiretail.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.name:Store Admin}")
    private String adminName;

    @Value("${app.admin.email:admin@ilahiretail.com}")
    private String adminEmail;

    @Value("${app.admin.password:Admin@12345}")
    private String adminPassword;

    @Value("${app.admin.phone:9876543210}")
    private String adminPhone;

    @Override
    @Transactional
    public void run(String... args) {
        // Ensure roles exist
        Role userRole = roleRepository.findByName("ROLE_USER")
                .orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_USER").build()));
        Role adminRole = roleRepository.findByName("ROLE_ADMIN")
                .orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_ADMIN").build()));

        // Seed initial admin user if not present
        if (!userRepository.existsByEmail(adminEmail)) {
            Set<Role> roles = new HashSet<>();
            roles.add(userRole);
            roles.add(adminRole);

            User admin = User.builder()
                    .name(adminName)
                    .email(adminEmail)
                    .password(passwordEncoder.encode(adminPassword))
                    .phone(adminPhone)
                    .roles(roles)
                    .build();

            userRepository.save(admin);
            log.info("Initial Admin user successfully seeded with email: {}", adminEmail);
        } else {
            log.info("Admin user with email {} already exists.", adminEmail);
        }
    }
}
