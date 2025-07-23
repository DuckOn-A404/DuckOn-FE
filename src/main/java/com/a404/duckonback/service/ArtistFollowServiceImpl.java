package com.a404.duckonback.service;

import com.a404.duckonback.entity.ArtistFollow;
import com.a404.duckonback.entity.ArtistFollowId;
import com.a404.duckonback.repository.ArtistFollowRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ArtistFollowServiceImpl implements ArtistFollowService {

    private final ArtistFollowRepository artistFollowRepository;

    @Override
    public ArtistFollow createArtistFollow(ArtistFollow artistFollow) {
        return artistFollowRepository.save(artistFollow);
    }

    @Override
    public Optional<ArtistFollow> getArtistFollow(String uuid, Integer artistId) {
        return artistFollowRepository.findById(new ArtistFollowId(uuid, artistId));
    }

    @Override
    public List<ArtistFollow> getFollowsByUser(String uuid) {
        return artistFollowRepository.findByUser_Uuid(uuid);
    }

    @Override
    public List<ArtistFollow> getFollowsByArtist(Integer artistId) {
        return artistFollowRepository.findByArtist_ArtistId(artistId);
    }

    @Override
    public void deleteArtistFollow(String uuid, Integer artistId) {
        artistFollowRepository.deleteByUser_UuidAndArtist_ArtistId(uuid, artistId);
    }

    @Override
    public boolean isFollowingArtist(String uuid, Integer artistId) {
        return artistFollowRepository.existsByUser_UuidAndArtist_ArtistId(uuid, artistId);
    }
}
