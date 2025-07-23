package com.a404.duckonback.service;

import com.a404.duckonback.entity.Artist;
import com.a404.duckonback.entity.ArtistFollow;
import com.a404.duckonback.entity.User;
import com.a404.duckonback.repository.ArtistFollowRepository;
import com.a404.duckonback.repository.ArtistRepository;
import com.a404.duckonback.repository.UserRepository;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ArtistService {

    private final ArtistRepository artistRepository;
    private final UserRepository userRepository;
    private final ArtistFollowRepository artistFollowRepository;

    public List<Integer> findAllArtistIdByUserUuid(String uuid){
        return artistRepository.findAllArtistIdByUserUuid(uuid);
    }

    public void followArtists(String uuid, List<Integer> artistList){
        User user = userRepository.findByUuid(uuid);

        for (Integer artistId : artistList) {
            Artist artist = artistRepository.findById(artistId)
                    .orElseThrow(() -> new RuntimeException("아티스트 없음: " + artistId));

            ArtistFollow artistFollow = ArtistFollow.builder()
                    .user(user)
                    .artist(artist)
                    .createdAt(LocalDateTime.now())
                    .build();

            artistFollowRepository.save(artistFollow);
        }
    }
}
