package com.a404.duckonback.service;

import com.a404.duckonback.entity.User;
import com.a404.duckonback.entity.UserBlock;
import com.a404.duckonback.entity.UserBlockId;
import com.a404.duckonback.repository.UserBlockRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UserBlockServiceImplTest {

    @Mock
    private UserBlockRepository userBlockRepository;

    @InjectMocks
    private UserBlockServiceImpl userBlockService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    private UserBlock getMockBlock() {
        return UserBlock.builder()
                .blocker(User.builder().uuid("blocker-uuid").build())
                .blocked(User.builder().uuid("blocked-uuid").build())
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    void createUserBlock_shouldReturnSavedBlock() {
        UserBlock block = getMockBlock();
        when(userBlockRepository.save(any(UserBlock.class))).thenReturn(block);

        UserBlock result = userBlockService.createUserBlock(block);

        assertNotNull(result);
        assertEquals("blocker-uuid", result.getBlocker().getUuid());
        assertEquals("blocked-uuid", result.getBlocked().getUuid());
        verify(userBlockRepository).save(block);
    }

    @Test
    void getUserBlock_shouldReturnBlock() {
        UserBlock block = getMockBlock();
        UserBlockId id = new UserBlockId("blocker-uuid", "blocked-uuid");

        when(userBlockRepository.findById(id)).thenReturn(Optional.of(block));

        Optional<UserBlock> result = userBlockService.getUserBlock("blocker-uuid", "blocked-uuid");

        assertTrue(result.isPresent());
        assertEquals("blocked-uuid", result.get().getBlocked().getUuid());
    }

    @Test
    void getBlocksByBlocker_shouldReturnList() {
        List<UserBlock> blocks = List.of(getMockBlock());
        when(userBlockRepository.findByBlocker_Uuid("blocker-uuid")).thenReturn(blocks);

        List<UserBlock> result = userBlockService.getBlocksByBlocker("blocker-uuid");

        assertEquals(1, result.size());
        verify(userBlockRepository).findByBlocker_Uuid("blocker-uuid");
    }

    @Test
    void getBlocksByBlocked_shouldReturnList() {
        List<UserBlock> blocks = List.of(getMockBlock());
        when(userBlockRepository.findByBlocked_Uuid("blocked-uuid")).thenReturn(blocks);

        List<UserBlock> result = userBlockService.getBlocksByBlocked("blocked-uuid");

        assertEquals(1, result.size());
        verify(userBlockRepository).findByBlocked_Uuid("blocked-uuid");
    }

    @Test
    void isUserBlocked_shouldReturnTrueIfExists() {
        when(userBlockRepository.existsByBlocker_UuidAndBlocked_Uuid("blocker-uuid", "blocked-uuid"))
                .thenReturn(true);

        boolean result = userBlockService.isUserBlocked("blocker-uuid", "blocked-uuid");

        assertTrue(result);
        verify(userBlockRepository).existsByBlocker_UuidAndBlocked_Uuid("blocker-uuid", "blocked-uuid");
    }

    @Test
    void deleteUserBlock_shouldCallDelete() {
        doNothing().when(userBlockRepository)
                .deleteByBlocker_UuidAndBlocked_Uuid("blocker-uuid", "blocked-uuid");

        userBlockService.deleteUserBlock("blocker-uuid", "blocked-uuid");

        verify(userBlockRepository).deleteByBlocker_UuidAndBlocked_Uuid("blocker-uuid", "blocked-uuid");
    }
}
