package com.jobportal.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "applications")
public class Application {
    @Id
    private String id;
    
    private String jobId;
    private String seekerId;
    private String seekerName;
    private String seekerEmail;
    private String resumeUrl; // Simplified as a string URL
    
    private String status = "PENDING"; // PENDING, ACCEPTED, REJECTED
    
    private LocalDateTime appliedAt = LocalDateTime.now();
}
