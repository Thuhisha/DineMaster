package com.dinemaster.main.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "locations")
public class Location {
    
    @Id
    private String id;
    private String name;
    private String city;
    private String address;
    private String phone;
    private String email;
    private String mapLink;
}
