package com.dinemaster.main.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "menu_items")
public class MenuItem {
    
    @Id
    private String id;
    private String name;
    private String description;
    private Double price;
    private String category;
    private Double rating;
    private String image;
    private Boolean available;
    private Integer stock;
}
