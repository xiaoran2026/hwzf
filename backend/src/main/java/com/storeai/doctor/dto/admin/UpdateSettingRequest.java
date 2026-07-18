package com.storeai.doctor.dto.admin;

import lombok.Data;

@Data
public class UpdateSettingRequest {
    private String key;
    private String value;
}
