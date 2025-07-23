package com.a404.duckonback.service;

import com.a404.duckonback.entity.Artist;
import com.a404.duckonback.entity.ArtistFollow;
import com.a404.duckonback.entity.ArtistFollowId;
import com.a404.duckonback.entity.User;
import com.a404.duckonback.repository.ArtistFollowRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ArtistFollowServiceImplTest {

    @Mock
    private ArtistFollowRepository artistFollowRepository;

    @InjectMocks
    private ArtistFollowServiceImpl artistFollowService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    private ArtistFollow getMockArtistFollow() {
        return ArtistFollow.builder()
                .user(User.builder().uuid("user-uuid").build())
                .artist(Artist.builder().artistId(123).build())
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    void createArtistFollow_shouldReturnSavedFollow() {
        ArtistFollow follow = getMockArtistFollow();
        when(artistFollowRepository.save(any(ArtistFollow.class))).thenReturn(follow);

        ArtistFollow result = artistFollowService.createArtistFollow(follow);

        assertNotNull(result);
        assertEquals("user-uuid", result.getUser().getUuid());
        assertEquals(123, result.getArtist().getArtistId());
        verify(artistFollowRepository).save(follow);
    }

    @Test
    void getArtistFollow_shouldReturnFollow() {
        ArtistFollow follow = getMockArtistFollow();
        ArtistFollowId id = new ArtistFollowId("user-uuid", 123);

        when(artistFollowRepository.findById(id)).thenReturn(Optional.of(follow));

        Optional<ArtistFollow> result = artistFollowService.getArtistFollow("user-uuid", 123);

        assertTrue(result.isPresent());
        assertEquals("user-uuid", result.get().getUser().getUuid());
    }

    @Test
    void getFollowsByUser_shouldReturnList() {
        List<ArtistFollow> follows = List.of(getMockArtistFollow());
        when(artistFollowRepository.findByUser_Uuid("user-uuid")).thenReturn(follows);

        List<ArtistFollow> result = artistFollowService.getFollowsByUser("user-uuid");

        assertEquals(1, result.size());
        verify(artistFollowRepository).findByUser_Uuid("user-uuid");
    }

    @Test
    void getFollowsByArtist_shouldReturnList() {
        List<ArtistFollow> follows = List.of(getMockArtistFollow());
        when(artistFollowRepository.findByArtist_ArtistId(123)).thenReturn(follows);

        List<ArtistFollow> result = artistFollowService.getFollowsByArtist(123);

        assertEquals(1, result.size());
        verify(artistFollowRepository).findByArtist_ArtistId(123);
    }

    @Test
    void deleteArtistFollow_shouldCallDelete() {
        doNothing().when(artistFollowRepository)
                .deleteByUser_UuidAndArtist_ArtistId("user-uuid", 123);

        artistFollowService.deleteArtistFollow("user-uuid", 123);

        verify(artistFollowRepository).deleteByUser_UuidAndArtist_ArtistId("user-uuid", 123);
    }

    @Test
    void isFollowingArtist_shouldReturnTrueIfExists() {
        when(artistFollowRepository.existsByUser_UuidAndArtist_ArtistId("user-uuid", 123))
                .thenReturn(true);

        boolean result = artistFollowService.isFollowingArtist("user-uuid", 123);

        assertTrue(result);
        verify(artistFollowRepository).existsByUser_UuidAndArtist_ArtistId("user-uuid", 123);
    }
}
