package com.dinemaster.auth.service;

import com.dinemaster.auth.dto.AuthResponse;
import com.dinemaster.auth.dto.LoginRequest;
import com.dinemaster.auth.dto.RegisterRequest;
import com.dinemaster.auth.model.Role;
import com.dinemaster.auth.model.User;
import com.dinemaster.auth.model.VerificationToken;
import com.dinemaster.auth.repository.UserRepository;
import com.dinemaster.auth.repository.VerificationTokenRepository;
import com.dinemaster.auth.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final VerificationTokenRepository tokenRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }
        if (request.getPhone() != null && !request.getPhone().isBlank() && userRepository.existsByPhone(request.getPhone())) {
            throw new RuntimeException("Phone number already registered");
        }

        User user = new User(
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                request.getName(),
                request.getPhone(),
                request.getBirthday(),
                Role.CUSTOMER
        );
        user.setVerified(false);

        User savedUser = userRepository.save(user);

        // Generate and save 6-digit verification code
        String tokenStr = String.format("%06d", new java.util.Random().nextInt(999999));
        VerificationToken verificationToken = new VerificationToken(tokenStr, savedUser);
        tokenRepository.save(verificationToken);
        
        // Send verification email
        try {
            emailService.sendVerificationEmail(savedUser.getEmail(), tokenStr);
        } catch (Exception e) {
            System.err.println("==========================================================");
            System.err.println("WARNING: Failed to send OTP email to " + savedUser.getEmail());
            System.err.println("SMTP Error: " + e.getMessage());
            System.err.println("==========================================================");
            System.err.println("DEVELOPMENT MODE FALLBACK: Your 6-digit OTP code is: " + tokenStr);
            System.err.println("==========================================================");
            // We don't throw the exception so that the user is still saved in DB
            // and the frontend can transition to the verification screen.
        }

        return new AuthResponse(
                "VERIFICATION_PENDING",
                savedUser.getRole().name(),
                savedUser.getEmail(),
                savedUser.getName(),
                savedUser.getId(),
                savedUser.getLoyaltyPoints()
        );
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        if (!user.isVerified()) {
            throw new RuntimeException("Please verify your email before logging in.");
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());

        return new AuthResponse(
                token,
                user.getRole().name(),
                user.getEmail(),
                user.getName(),
                user.getId(),
                user.getLoyaltyPoints()
        );
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public java.util.List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public void verifyEmail(String email, String code) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        VerificationToken token = tokenRepository.findByToken(code)
                .orElseThrow(() -> new RuntimeException("Invalid verification code"));

        if (!token.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Invalid verification code for this email");
        }

        if (token.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Verification code has expired");
        }

        user.setVerified(true);
        userRepository.save(user);
        
        tokenRepository.delete(token);
    }

    public void resetPassword(String email, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public void resendVerificationEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.isVerified()) {
            throw new RuntimeException("User is already verified.");
        }

        VerificationToken existingToken = tokenRepository.findByUserId(user.getId());
        if (existingToken != null) {
            tokenRepository.delete(existingToken);
        }

        String tokenStr = String.format("%06d", new java.util.Random().nextInt(999999));
        VerificationToken verificationToken = new VerificationToken(tokenStr, user);
        tokenRepository.save(verificationToken);

        try {
            emailService.sendVerificationEmail(user.getEmail(), tokenStr);
        } catch (Exception e) {
            System.err.println("WARNING: Failed to send OTP email to " + user.getEmail());
            System.err.println("SMTP Error: " + e.getMessage());
            System.err.println("DEVELOPMENT MODE FALLBACK: Your new 6-digit OTP code is: " + tokenStr);
        }
    }

    public void addLoyaltyPoints(Long userId, Integer points) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setLoyaltyPoints((user.getLoyaltyPoints() != null ? user.getLoyaltyPoints() : 0) + points);
        userRepository.save(user);
    }
}
