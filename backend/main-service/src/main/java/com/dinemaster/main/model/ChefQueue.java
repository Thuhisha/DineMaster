package com.dinemaster.main.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "chef_queue")
public class ChefQueue {
    
    @Id
    private String id;
    private String reservationId;
    private String orderId;
    private String customerName;
    private Integer tableNumber;
    private String items;
    private String specialRequests;
    private String reservationTime;
    private String status;
    private String kitchenStatus;
    private Boolean isNew;
    private LocalDateTime updatedAt;
}
