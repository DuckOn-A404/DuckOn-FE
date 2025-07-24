package com.a404.duckonback.service;

import com.a404.duckonback.entity.Follow;
import com.a404.duckonback.entity.FollowId;
import com.a404.duckonback.repository.FollowRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class FollowServiceImpl implements FollowService {

    private final FollowRepository followRepository;

    @Override
    public Follow createFollow(Follow follow) {
        return followRepository.save(follow);
    }

    @Override
    public Optional<Follow> getFollow(String followerUuid, String followingUuid) {
        return followRepository.findById(new FollowId(followerUuid, followingUuid));
    }

    @Override
    public List<Follow> getFollowings(String followerUuid) {
        return followRepository.findByFollower_Uuid(followerUuid);
    }

    @Override
    public List<Follow> getFollowers(String followingUuid) {
        return followRepository.findByFollowing_Uuid(followingUuid);
    }

    @Override
    public void deleteFollow(String followerUuid, String followingUuid) {
        followRepository.deleteByFollower_UuidAndFollowing_Uuid(followerUuid, followingUuid);
    }

    @Override
    public boolean isFollowing(String followerUuid, String followingUuid) {
        return followRepository.existsByFollower_UuidAndFollowing_Uuid(followerUuid, followingUuid);
    }
}
