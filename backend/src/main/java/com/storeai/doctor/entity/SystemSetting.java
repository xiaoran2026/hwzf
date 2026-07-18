package com.storeai.doctor.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "system_settings", uniqueConstraints = @UniqueConstraint(columnNames = "setting_key"))
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SystemSetting {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "setting_key", nullable = false, length = 100)
    private String settingKey;

    @Column(name = "setting_value", columnDefinition = "TEXT")
    private String settingValue;

    @Column(name = "setting_type", length = 50)
    private String settingType;

    @Column(name = "encrypted")
    private Boolean encrypted = false;

    @Column(name = "category", length = 50)
    private String category;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "updated_time")
    private LocalDateTime updatedTime = LocalDateTime.now();
}
