package com.storeai.doctor.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminUserDTO {
    private Long id;
    private String email;
    private String plan;
    private String role;
    private Boolean banned;
    private long storeCount;
    private long reportCount;
    private String createdTime;
}