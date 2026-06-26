package com.dinemaster.main.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "reservations")
public class Reservation {
    
    @Id
    private String id;
    private String userId;
    private String branchId;
    private String date;
    private String time;
    private Integer guests;
    private String tableId;
    private Integer tableNumber;
    private String name;
    private String email;
    private String phone;
    private String birthday;
    private String specialRequests;
    private Map<String, Object> birthdayOffer;
    private String status;
    private String paymentStatus;
    private String paymentMethod;
    private Double totalAmount;
    private String paymentRef;
    private Integer loyaltyEarned;
    private LocalDateTime createdAt;
}
