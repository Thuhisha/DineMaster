package com.dinemaster.main.controller;

import com.dinemaster.main.service.PaymentService;
import com.razorpay.RazorpayException;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@RequestBody OrderRequest request) {
        try {
            Map<String, Object> orderDetails = paymentService.createOrder(request.getAmount(), request.getReceiptId());
            // Map the key from 'orderId' to 'razorpayOrderId' to match the frontend expectation
            if (orderDetails.containsKey("orderId")) {
                orderDetails.put("razorpayOrderId", orderDetails.get("orderId"));
            }
            return ResponseEntity.ok(orderDetails);
        } catch (RazorpayException e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(@RequestBody VerificationRequest request) {
        boolean isValid = paymentService.verifySignature(
                request.getRazorpayOrderId(),
                request.getRazorpayPaymentId(),
                request.getRazorpaySignature()
        );

        if (isValid) {
            return ResponseEntity.ok(Map.of("status", "success"));
        } else {
            return ResponseEntity.badRequest().body(Map.of("status", "failed", "error", "Invalid signature"));
        }
    }

    @Data
    public static class OrderRequest {
        private Double amount;
        private String receiptId;
    }

    @Data
    public static class VerificationRequest {
        private String razorpayOrderId;
        private String razorpayPaymentId;
        private String razorpaySignature;
    }
}
