package com.dinemaster.main.dto;

import com.dinemaster.main.model.Order;
import lombok.Data;
import java.util.List;

@Data
public class OrderCalculationRequest {
    private String email;
    private String date; // The date of the reservation
    private List<Order.OrderItem> items;
}
