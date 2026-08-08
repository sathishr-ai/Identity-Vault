package com.blockid.platform.repository;

import com.blockid.platform.model.BlockchainBlock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.Optional;
import java.util.List;

public interface BlockchainBlockRepository extends JpaRepository<BlockchainBlock, Long> {
    Optional<BlockchainBlock> findByBlockNumber(Long blockNumber);

    Optional<BlockchainBlock> findByIdentityId(Long identityId);

    @Query("SELECT COALESCE(MAX(b.blockNumber), 0L) FROM BlockchainBlock b")
    Long findMaxBlockNumber();

    @Query("SELECT b FROM BlockchainBlock b ORDER BY b.blockNumber DESC")
    List<BlockchainBlock> findAllBlocksSortedByNumberDesc();
}
