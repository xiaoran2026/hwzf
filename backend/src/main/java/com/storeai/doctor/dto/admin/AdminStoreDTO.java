package com.storeai.doctor.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminStoreDTO {
    private Long id;
    private Long userId;
    private String userEmail;
    private String storeName;
    private String platform;
    private long uploadCount;
    private long taskCount;
    private String createdTime;
}