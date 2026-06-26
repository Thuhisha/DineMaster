package com.dinemaster.main.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "offers")
public class Offer {
    
    @Id
    private String id;
    private String title;
    private String desc;
    private Double minAmount;
    private Double percent;
    private String reward;
    private Boolean active;
}
