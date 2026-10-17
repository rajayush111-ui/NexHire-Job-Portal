package com.jobportal.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "jobs")
public class Job {
    @Id
    private String id;

    @NotBlank
    private String title;

    @NotBlank
    private String company;

    @NotBlank
    private String location;

    @NotBlank
    private String description;

    private String salary;
    
    private List<String> skills;

    private String postedBy; // User ID of the recruiter

    private LocalDateTime createdAt = LocalDateTime.now();
}
