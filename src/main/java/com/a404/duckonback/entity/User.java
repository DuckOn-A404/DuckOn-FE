package com.a404.duckonback.entity;

import com.a404.duckonback.enums.UserRole;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.*;

@Entity
@Table(name = "user")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @Column(name = "uuid", nullable = false, length = 255)
    private String uuid;

    @Column(name = "email", nullable = false, unique = true, length = 255)
    private String email;

    @Column(name = "user_id", nullable = false, unique = true, length = 50)
    private String userId;

    @Column(name = "password", nullable = false, length = 255)
    private String password;

    @Column(name = "nickname", nullable = false, length = 100)
    private String nickname;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private UserRole role;

    @Column(name = "language", nullable = false, length = 2)
    private String language;

    @Column(name = "img_url", columnDefinition = "TEXT")
    private String imgUrl;


    @OneToMany(mappedBy = "reporter")
    private List<Report> reportsAsReporter;

    @OneToMany(mappedBy = "reported")
    private List<Report> reportsAsReported;

    @OneToMany(mappedBy = "blocker")
    private List<UserBlock> blockedUsers;

    @OneToMany(mappedBy = "blocked")
    private List<UserBlock> blockedByUsers;

    @OneToMany(mappedBy = "follower")
    private List<Follow> following;

    @OneToMany(mappedBy = "following")
    private List<Follow> followers;

    @OneToMany(mappedBy = "user")
    private List<ArtistFollow> artistFollows;

    @OneToMany(mappedBy = "user")
    private List<Penalty> penalties;

    @OneToMany(mappedBy = "creator")
    private List<Room> rooms;
}
