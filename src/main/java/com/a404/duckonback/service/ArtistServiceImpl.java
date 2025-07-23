package com.a404.duckonback.service;

import com.a404.duckonback.entity.Artist;
import com.a404.duckonback.repository.ArtistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ArtistServiceImpl implements ArtistService {

    private final ArtistRepository artistRepository;

    @Override
    public Artist createArtist(Artist artist) {
        return artistRepository.save(artist);
    }

    @Override
    public Optional<Artist> getArtistById(Integer artistId) {
        return artistRepository.findById(artistId);
    }

    @Override
    public List<Artist> getAllArtists() {
        return artistRepository.findAll();
    }

    @Override
    public Artist updateArtist(Integer artistId, Artist updatedArtist) {
        return artistRepository.findById(artistId)
                .map(artist -> {
                    artist.setNameEn(updatedArtist.getNameEn());
                    artist.setNameKr(updatedArtist.getNameKr());
                    artist.setDebutDate(updatedArtist.getDebutDate());
                    artist.setImgUrl(updatedArtist.getImgUrl());
                    return artistRepository.save(artist);
                })
                .orElseThrow(() -> new IllegalArgumentException("Artist not found"));
    }

    @Override
    public void deleteArtist(Integer artistId) {
        artistRepository.deleteById(artistId);
    }
}
