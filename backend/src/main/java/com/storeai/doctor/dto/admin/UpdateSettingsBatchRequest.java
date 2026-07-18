package com.storeai.doctor.dto.admin;

import lombok.Data;

import java.util.Map;

@Data
public class UpdateSettingsBatchRequest {
    private Map<String, String> settings;
}
