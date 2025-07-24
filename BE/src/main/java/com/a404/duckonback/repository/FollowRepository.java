package com.a404.duckonback.repository;

import com.a404.duckonback.entity.Follow;
import com.a404.duckonback.entity.FollowId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FollowRepository extends JpaRepository<Follow, FollowId> {
    List<Follow> findByFollower_Uuid(String followerUuid);
    List<Follow> findByFollowing_Uuid(String followingUuid);
    boolean existsByFollower_UuidAndFollowing_Uuid(String followerUuid, String followingUuid);
    void deleteByFollower_UuidAndFollowing_Uuid(String followerUuid, String followingUuid);
}
