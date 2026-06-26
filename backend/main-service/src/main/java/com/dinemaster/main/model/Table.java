package com.dinemaster.main.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "tables")
public class Table {
    
    @Id
    private String id;
    private Integer number;
    private Integer capacity;
    private String status;
    private String branchId;
}
