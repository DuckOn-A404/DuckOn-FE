package com.a404.duckonback.service;

import com.a404.duckonback.entity.UserBlock;
import com.a404.duckonback.entity.UserBlockId;
import com.a404.duckonback.repository.UserBlockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserBlockServiceImpl implements UserBlockService {

    private final UserBlockRepository userBlockRepository;

    @Override
    public UserBlock createUserBlock(UserBlock userBlock) {
        return userBlockRepository.save(userBlock);
    }

    @Override
    public Optional<UserBlock> getUserBlock(String blockerUuid, String blockedUuid) {
        return userBlockRepository.findById(new UserBlockId(blockerUuid, blockedUuid));
    }

    @Override
    public List<UserBlock> getBlocksByBlocker(String blockerUuid) {
        return userBlockRepository.findByBlocker_Uuid(blockerUuid);
    }

    @Override
    public List<UserBlock> getBlocksByBlocked(String blockedUuid) {
        return userBlockRepository.findByBlocked_Uuid(blockedUuid);
    }

    @Override
    public boolean isUserBlocked(String blockerUuid, String blockedUuid) {
        return userBlockRepository.existsByBlocker_UuidAndBlocked_Uuid(blockerUuid, blockedUuid);
    }

    @Override
    public void deleteUserBlock(String blockerUuid, String blockedUuid) {
        userBlockRepository.deleteByBlocker_UuidAndBlocked_Uuid(blockerUuid, blockedUuid);
    }
}
