package com.storeai.doctor.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SystemSettingDTO {
    private String key;
    private String value;
    private String type;
    private String category;
    private String description;
    private String updatedTime;
}
