package com.a404.duckonback.service;

import com.a404.duckonback.entity.Artist;

import java.util.List;
import java.util.Optional;

public interface ArtistService {
    Artist createArtist(Artist artist);
    Optional<Artist> getArtistById(Integer artistId);
    List<Artist> getAllArtists();
    Artist updateArtist(Integer artistId, Artist updatedArtist);
    void deleteArtist(Integer artistId);
}
