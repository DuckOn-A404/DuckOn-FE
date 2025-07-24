package com.a404.duckonback.service;

import com.a404.duckonback.entity.Penalty;
import com.a404.duckonback.entity.User;
import com.a404.duckonback.enums.PenaltyStatus;
import com.a404.duckonback.enums.PenaltyType;
import com.a404.duckonback.repository.PenaltyRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class PenaltyServiceImplTest {

    @Mock
    private PenaltyRepository penaltyRepository;

    @InjectMocks
    private PenaltyServiceImpl penaltyService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    private Penalty getMockPenalty() {
        return Penalty.builder()
                .penaltyId(1L)
                .user(User.builder().uuid("user-uuid").build())
                .penaltyType(PenaltyType.CHAT_BAN)
                .status(PenaltyStatus.ACTIVE)
                .reason("욕설")
                .startAt(LocalDateTime.now().minusDays(1))
                .endAt(LocalDateTime.now().plusDays(2))
                .build();
    }

    @Test
    void createPenalty_shouldReturnSavedPenalty() {
        Penalty penalty = getMockPenalty();
        when(penaltyRepository.save(any(Penalty.class))).thenReturn(penalty);

        Penalty result = penaltyService.createPenalty(penalty);

        assertNotNull(result);
        assertEquals(PenaltyType.CHAT_BAN, result.getPenaltyType());
        verify(penaltyRepository).save(penalty);
    }

    @Test
    void getPenaltyById_shouldReturnPenalty() {
        Penalty penalty = getMockPenalty();
        when(penaltyRepository.findById(1L)).thenReturn(Optional.of(penalty));

        Optional<Penalty> result = penaltyService.getPenaltyById(1L);

        assertTrue(result.isPresent());
        assertEquals(PenaltyStatus.ACTIVE, result.get().getStatus());
    }

    @Test
    void getAllPenalties_shouldReturnList() {
        when(penaltyRepository.findAll()).thenReturn(List.of(getMockPenalty()));

        List<Penalty> result = penaltyService.getAllPenalties();

        assertEquals(1, result.size());
        verify(penaltyRepository).findAll();
    }

    @Test
    void updatePenalty_shouldChangeFields() {
        Penalty existing = getMockPenalty();
        Penalty updated = getMockPenalty();
        updated.setStatus(PenaltyStatus.RELEASED);

        when(penaltyRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(penaltyRepository.save(any(Penalty.class))).thenReturn(updated);

        Penalty result = penaltyService.updatePenalty(1L, updated);

        assertEquals(PenaltyStatus.RELEASED, result.getStatus());
        verify(penaltyRepository).save(any(Penalty.class));
    }

    @Test
    void deletePenalty_shouldCallDeleteById() {
        doNothing().when(penaltyRepository).deleteById(1L);

        penaltyService.deletePenalty(1L);

        verify(penaltyRepository).deleteById(1L);
    }

    @Test
    void getPenaltiesByUser_shouldReturnList() {
        when(penaltyRepository.findByUser_Uuid("user-uuid")).thenReturn(List.of(getMockPenalty()));

        List<Penalty> result = penaltyService.getPenaltiesByUser("user-uuid");

        assertEquals(1, result.size());
        verify(penaltyRepository).findByUser_Uuid("user-uuid");
    }

    @Test
    void getPenaltiesByStatus_shouldReturnList() {
        when(penaltyRepository.findByStatus(PenaltyStatus.ACTIVE)).thenReturn(List.of(getMockPenalty()));

        List<Penalty> result = penaltyService.getPenaltiesByStatus(PenaltyStatus.ACTIVE);

        assertEquals(1, result.size());
        verify(penaltyRepository).findByStatus(PenaltyStatus.ACTIVE);
    }

    @Test
    void getPenaltiesByType_shouldReturnList() {
        when(penaltyRepository.findByPenaltyType(PenaltyType.CHAT_BAN)).thenReturn(List.of(getMockPenalty()));

        List<Penalty> result = penaltyService.getPenaltiesByType(PenaltyType.CHAT_BAN);

        assertEquals(1, result.size());
        verify(penaltyRepository).findByPenaltyType(PenaltyType.CHAT_BAN);
    }
}
