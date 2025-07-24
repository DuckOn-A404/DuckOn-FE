package com.a404.duckonback.service;

import com.a404.duckonback.entity.Follow;
import com.a404.duckonback.entity.FollowId;
import com.a404.duckonback.entity.User;
import com.a404.duckonback.repository.FollowRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class FollowServiceImplTest {

    @Mock
    private FollowRepository followRepository;

    @InjectMocks
    private FollowServiceImpl followService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    private Follow getMockFollow() {
        return Follow.builder()
                .follower(User.builder().uuid("userA").build())
                .following(User.builder().uuid("userB").build())
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    void createFollow_shouldReturnSavedFollow() {
        Follow follow = getMockFollow();
        when(followRepository.save(any(Follow.class))).thenReturn(follow);

        Follow result = followService.createFollow(follow);

        assertNotNull(result);
        assertEquals("userA", result.getFollower().getUuid());
        assertEquals("userB", result.getFollowing().getUuid());
        verify(followRepository).save(follow);
    }

    @Test
    void getFollow_shouldReturnFollow() {
        Follow follow = getMockFollow();
        FollowId followId = new FollowId("userA", "userB");

        when(followRepository.findById(followId)).thenReturn(Optional.of(follow));

        Optional<Follow> result = followService.getFollow("userA", "userB");

        assertTrue(result.isPresent());
        assertEquals("userA", result.get().getFollower().getUuid());
    }

    @Test
    void getFollowings_shouldReturnList() {
        List<Follow> followList = List.of(getMockFollow());
        when(followRepository.findByFollower_Uuid("userA")).thenReturn(followList);

        List<Follow> result = followService.getFollowings("userA");

        assertEquals(1, result.size());
        verify(followRepository).findByFollower_Uuid("userA");
    }

    @Test
    void getFollowers_shouldReturnList() {
        List<Follow> followList = List.of(getMockFollow());
        when(followRepository.findByFollowing_Uuid("userB")).thenReturn(followList);

        List<Follow> result = followService.getFollowers("userB");

        assertEquals(1, result.size());
        verify(followRepository).findByFollowing_Uuid("userB");
    }

    @Test
    void deleteFollow_shouldCallDeleteById() {
        doNothing().when(followRepository).deleteByFollower_UuidAndFollowing_Uuid("userA", "userB");

        followService.deleteFollow("userA", "userB");

        verify(followRepository).deleteByFollower_UuidAndFollowing_Uuid("userA", "userB");
    }

    @Test
    void isFollowing_shouldReturnTrueIfExists() {
        when(followRepository.existsByFollower_UuidAndFollowing_Uuid("userA", "userB")).thenReturn(true);

        boolean result = followService.isFollowing("userA", "userB");

        assertTrue(result);
        verify(followRepository).existsByFollower_UuidAndFollowing_Uuid("userA", "userB");
    }
}
