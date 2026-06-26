package com.dinemaster.auth.config;

import com.dinemaster.auth.model.Role;
import com.dinemaster.auth.model.User;
import com.dinemaster.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (!userRepository.existsByEmail("admin@dinemaster.com")) {
            User admin = new User(
                    "admin@dinemaster.com",
                    passwordEncoder.encode("admin123"),
                    "System Admin",
                    "0000000000",
                    "1990-01-01",
                    Role.ADMIN
            );
            admin.setVerified(true);
            userRepository.save(admin);
        }

        if (!userRepository.existsByEmail("chef@dinemaster.com")) {
            User chef = new User(
                    "chef@dinemaster.com",
                    passwordEncoder.encode("chef123"),
                    "Head Chef",
                    "1111111111",
                    "1985-05-15",
                    Role.CHEF
            );
            chef.setVerified(true);
            userRepository.save(chef);
        }

        System.out.println("Auth service started - default admin and chef created if not exists");
    }
}
