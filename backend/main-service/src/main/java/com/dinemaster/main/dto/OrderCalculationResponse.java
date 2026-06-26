package com.dinemaster.main.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderCalculationResponse {
    private Double subtotal;
    private Double tax;
    private Double discount;
    private Double total;
    private Map<String, Object> birthdayOffer;
}
