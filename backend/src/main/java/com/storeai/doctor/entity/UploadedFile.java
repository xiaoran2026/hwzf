package com.storeai.doctor.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "uploaded_files")
public class UploadedFile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id", nullable = false)
    private Store store;

    @Column(name = "file_name")
    private String fileName;

    @JsonIgnore
    @Column(name = "file_path", length = 500)
    private String filePath;

    @Column(length = 50)
    private String status;

    @Column(name = "file_hash", length = 64)
    private String fileHash;

    @Column(name = "created_time")
    private LocalDateTime createdTime = LocalDateTime.now();
}
