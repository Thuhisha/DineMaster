package com.dinemaster.auth.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendVerificationEmail(String toEmail, String verificationToken) {
        String subject = "DineMaster - Verify Your Email Address";
        String message = "Welcome to DineMaster!\n\n"
                + "Your 6-digit verification code is: " + verificationToken + "\n\n"
                + "Please enter this code on the registration screen to activate your account.\n"
                + "This code will expire in 24 hours.\n\n"
                + "If you did not request this, please ignore this email.";

        SimpleMailMessage email = new SimpleMailMessage();
        email.setTo(toEmail);
        email.setSubject(subject);
        email.setText(message);
        
        mailSender.send(email);
    }
}
