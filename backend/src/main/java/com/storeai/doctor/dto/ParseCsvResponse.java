package com.storeai.doctor.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ParseCsvResponse {

    private int totalRows;

    private List<OrderDataDTO> orders;
}
