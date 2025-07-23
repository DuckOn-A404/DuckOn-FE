package com.a404.duckonback.service;

import com.a404.duckonback.entity.ArtistFollow;

import java.util.List;
import java.util.Optional;

public interface ArtistFollowService {
    ArtistFollow createArtistFollow(ArtistFollow artistFollow);
    Optional<ArtistFollow> getArtistFollow(String uuid, Integer artistId);
    List<ArtistFollow> getFollowsByUser(String uuid);
    List<ArtistFollow> getFollowsByArtist(Integer artistId);
    void deleteArtistFollow(String uuid, Integer artistId);
    boolean isFollowingArtist(String uuid, Integer artistId);
}
