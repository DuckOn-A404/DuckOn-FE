package com.a404.duckonback.service;

import com.a404.duckonback.entity.User;
import com.a404.duckonback.enums.UserRole;
import com.a404.duckonback.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;

    private UserService userService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        userService = new UserServiceImpl(userRepository);
    }

    private User getMockUser() {
        return User.builder()
                .uuid("test-uuid")
                .email("test@example.com")
                .userId("testuser")
                .password("hashedpassword")
                .nickname("테스트")
                .createdAt(LocalDateTime.now())
                .role(UserRole.USER)
                .language("ko")
                .imgUrl("http://image.com/profile.jpg")
                .build();
    }

    @Test
    void createUser_shouldReturnSavedUser() {
        User user = getMockUser();
        when(userRepository.save(any(User.class))).thenReturn(user);

        User saved = userService.createUser(user);

        assertNotNull(saved);
        assertEquals(user.getUuid(), saved.getUuid());
        verify(userRepository, times(1)).save(user);
    }

    @Test
    void getUserByUuid_shouldReturnUser() {
        User user = getMockUser();
        when(userRepository.findById(user.getUuid())).thenReturn(Optional.of(user));

        Optional<User> result = userService.getUserByUuid(user.getUuid());

        assertTrue(result.isPresent());
        assertEquals(user.getUuid(), result.get().getUuid());
        verify(userRepository).findById(user.getUuid());
    }

    @Test
    void getAllUsers_shouldReturnList() {
        List<User> users = List.of(getMockUser());
        when(userRepository.findAll()).thenReturn(users);

        List<User> result = userService.getAllUsers();

        assertEquals(1, result.size());
        verify(userRepository).findAll();
    }

    @Test
    void updateUser_shouldModifyFields() {
        User existing = getMockUser();
        User updated = getMockUser();
        updated.setNickname("업데이트됨");

        when(userRepository.findById(existing.getUuid())).thenReturn(Optional.of(existing));
        when(userRepository.save(any(User.class))).thenReturn(updated);

        User result = userService.updateUser(existing.getUuid(), updated);

        assertEquals("업데이트됨", result.getNickname());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void deleteUser_shouldCallDeleteById() {
        String uuid = "test-uuid";

        doNothing().when(userRepository).deleteById(uuid);

        userService.deleteUser(uuid);

        verify(userRepository, times(1)).deleteById(uuid);
    }
}
