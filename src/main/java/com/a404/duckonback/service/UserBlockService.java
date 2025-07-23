package com.a404.duckonback.service;

import com.a404.duckonback.entity.UserBlock;

import java.util.List;
import java.util.Optional;

public interface UserBlockService {
    UserBlock createUserBlock(UserBlock userBlock);
    Optional<UserBlock> getUserBlock(String blockerUuid, String blockedUuid);
    List<UserBlock> getBlocksByBlocker(String blockerUuid);
    List<UserBlock> getBlocksByBlocked(String blockedUuid);
    boolean isUserBlocked(String blockerUuid, String blockedUuid);
    void deleteUserBlock(String blockerUuid, String blockedUuid);
}
