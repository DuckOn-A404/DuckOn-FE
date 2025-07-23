package com.a404.duckonback.repository;

import com.a404.duckonback.entity.ArtistFollow;
import com.a404.duckonback.entity.ArtistFollowId;
import com.a404.duckonback.entity.User;
import com.a404.duckonback.entity.Artist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ArtistFollowRepository extends JpaRepository<ArtistFollow, ArtistFollowId> {

}
