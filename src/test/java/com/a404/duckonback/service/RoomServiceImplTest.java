package com.a404.duckonback.service;

import com.a404.duckonback.entity.Artist;
import com.a404.duckonback.entity.Room;
import com.a404.duckonback.entity.User;
import com.a404.duckonback.repository.RoomRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class RoomServiceImplTest {

    @Mock
    private RoomRepository roomRepository;

    @InjectMocks
    private RoomServiceImpl roomService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    private Room getMockRoom() {
        return Room.builder()
                .roomId(1)
                .title("테스트 방")
                .imgUrl("http://image.com/room.jpg")
                .createdAt(LocalDateTime.now())
                .creator(User.builder().uuid("creator-uuid").build())
                .artist(Artist.builder().artistId(99).build())
                .build();
    }

    @Test
    void createRoom_shouldReturnSavedRoom() {
        Room room = getMockRoom();
        when(roomRepository.save(any(Room.class))).thenReturn(room);

        Room saved = roomService.createRoom(room);

        assertNotNull(saved);
        assertEquals("테스트 방", saved.getTitle());
        verify(roomRepository).save(room);
    }

    @Test
    void getRoomById_shouldReturnRoom() {
        Room room = getMockRoom();
        when(roomRepository.findById(room.getRoomId())).thenReturn(Optional.of(room));

        Optional<Room> result = roomService.getRoomById(room.getRoomId());

        assertTrue(result.isPresent());
        assertEquals(room.getRoomId(), result.get().getRoomId());
        verify(roomRepository).findById(room.getRoomId());
    }

    @Test
    void getAllRooms_shouldReturnList() {
        List<Room> rooms = List.of(getMockRoom());
        when(roomRepository.findAll()).thenReturn(rooms);

        List<Room> result = roomService.getAllRooms();

        assertEquals(1, result.size());
        verify(roomRepository).findAll();
    }

    @Test
    void updateRoom_shouldModifyRoomFields() {
        Room original = getMockRoom();
        Room updated = getMockRoom();
        updated.setTitle("업데이트된 방 제목");

        when(roomRepository.findById(original.getRoomId())).thenReturn(Optional.of(original));
        when(roomRepository.save(any(Room.class))).thenReturn(updated);

        Room result = roomService.updateRoom(original.getRoomId(), updated);

        assertEquals("업데이트된 방 제목", result.getTitle());
        verify(roomRepository).save(any(Room.class));
    }

    @Test
    void deleteRoom_shouldCallDeleteById() {
        Integer roomId = 1;

        doNothing().when(roomRepository).deleteById(roomId);

        roomService.deleteRoom(roomId);

        verify(roomRepository).deleteById(roomId);
    }

    @Test
    void getRoomsByCreator_shouldReturnList() {
        String uuid = "creator-uuid";
        List<Room> rooms = List.of(getMockRoom());
        when(roomRepository.findByCreator_Uuid(uuid)).thenReturn(rooms);

        List<Room> result = roomService.getRoomsByCreator(uuid);

        assertEquals(1, result.size());
        verify(roomRepository).findByCreator_Uuid(uuid);
    }

    @Test
    void getRoomsByArtist_shouldReturnList() {
        Integer artistId = 99;
        List<Room> rooms = List.of(getMockRoom());
        when(roomRepository.findByArtist_ArtistId(artistId)).thenReturn(rooms);

        List<Room> result = roomService.getRoomsByArtist(artistId);

        assertEquals(1, result.size());
        verify(roomRepository).findByArtist_ArtistId(artistId);
    }
}
