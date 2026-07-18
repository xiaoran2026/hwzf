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
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @JsonIgnore
    @Column
    private String password;

    @Column(length = 50)
    private String plan = "FREE";

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private com.storeai.doctor.enums.RoleEnum role = com.storeai.doctor.enums.RoleEnum.USER;

    @Column(nullable = false)
    private Boolean banned = false;

    @Column(name = "created_time")
    private LocalDateTime createdTime = LocalDateTime.now();
}
