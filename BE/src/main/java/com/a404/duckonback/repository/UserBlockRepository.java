package com.a404.duckonback.repository;

import com.a404.duckonback.entity.UserBlock;
import com.a404.duckonback.entity.UserBlockId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserBlockRepository extends JpaRepository<UserBlock, UserBlockId> {
    List<UserBlock> findByBlocker_Uuid(String blockerUuid);
    List<UserBlock> findByBlocked_Uuid(String blockedUuid);
    boolean existsByBlocker_UuidAndBlocked_Uuid(String blockerUuid, String blockedUuid);
    void deleteByBlocker_UuidAndBlocked_Uuid(String blockerUuid, String blockedUuid);
}
