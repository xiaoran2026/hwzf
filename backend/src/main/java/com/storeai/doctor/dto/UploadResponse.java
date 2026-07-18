package com.storeai.doctor.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UploadResponse {

    private Long fileId;

    private String fileName;

    private String status;

    private Long storeId;

    private Long taskId;
}
