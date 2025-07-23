package com.a404.duckonback.service;

import com.a404.duckonback.entity.Follow;

import java.util.List;
import java.util.Optional;

public interface FollowService {
    Follow createFollow(Follow follow);
    Optional<Follow> getFollow(String followerUuid, String followingUuid);
    List<Follow> getFollowings(String followerUuid);
    List<Follow> getFollowers(String followingUuid);
    void deleteFollow(String followerUuid, String followingUuid);
    boolean isFollowing(String followerUuid, String followingUuid);
}
