package com.dinemaster.auth.controller;

import com.dinemaster.auth.dto.AuthResponse;
import com.dinemaster.auth.dto.LoginRequest;
import com.dinemaster.auth.dto.RegisterRequest;
import com.dinemaster.auth.dto.ResetPasswordRequest;
import com.dinemaster.auth.model.User;
import com.dinemaster.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor

public class AuthController {

    private final AuthService authService;

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<String> handleRuntimeException(RuntimeException ex) {
        return ResponseEntity.badRequest().body(ex.getMessage());
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request.getEmail(), request.getNewPassword());
        return ResponseEntity.ok("Password successfully reset");
    }

    @GetMapping("/user/{email}")
    public ResponseEntity<User> getUserByEmail(@PathVariable String email) {
        User user = authService.getUserByEmail(email);
        return ResponseEntity.ok(user);
    }

    @GetMapping("/users")
    public ResponseEntity<java.util.List<User>> getAllUsers() {
        return ResponseEntity.ok(authService.getAllUsers());
    }

    @PostMapping("/verify")
    public ResponseEntity<String> verifyEmail(@Valid @RequestBody com.dinemaster.auth.dto.VerifyRequest request) {
        try {
            authService.verifyEmail(request.getEmail(), request.getCode());
            return ResponseEntity.ok("Email verified successfully! You can now log in.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<String> resendVerification(@RequestBody java.util.Map<String, String> request) {
        try {
            String email = request.get("email");
            if (email == null || email.isBlank()) {
                return ResponseEntity.badRequest().body("Email is required");
            }
            authService.resendVerificationEmail(email);
            return ResponseEntity.ok("Verification email resent successfully.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/user/{id}/loyalty")
    public ResponseEntity<String> addLoyaltyPoints(@PathVariable Long id, @RequestBody java.util.Map<String, Integer> request) {
        try {
            Integer points = request.get("points");
            if (points == null || points <= 0) {
                return ResponseEntity.badRequest().body("Valid points required");
            }
            authService.addLoyaltyPoints(id, points);
            return ResponseEntity.ok("Loyalty points updated");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
