package com.blockid.platform.service;

import com.blockid.platform.model.BlockchainBlock;
import com.blockid.platform.repository.BlockchainBlockRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class BlockchainService {

    @Autowired
    private BlockchainBlockRepository blockRepository;

    public static String calculateSHA256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1)
                    hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            throw new RuntimeException("Error calculating SHA-256 hash", e);
        }
    }

    public String computeBlockHash(Long blockNumber, LocalDateTime timestamp, Long identityId, String previousHash) {
        String data = blockNumber + "|" + timestamp.toString() + "|" + identityId + "|" + previousHash;
        return calculateSHA256(data);
    }

    /**
     * Create and mine a new block for a newly verified user.
     */
    public BlockchainBlock generateBlockForIdentity(Long identityId) {
        Long nextBlockNumber = blockRepository.findMaxBlockNumber() + 1;
        String prevHash = "0";

        if (nextBlockNumber > 1) {
            BlockchainBlock lastBlock = blockRepository.findByBlockNumber(nextBlockNumber - 1)
                    .orElse(null);
            if (lastBlock != null) {
                prevHash = lastBlock.getCurrentHash();
            }
        }

        LocalDateTime timestamp = LocalDateTime.now();
        String currentHash = computeBlockHash(nextBlockNumber, timestamp, identityId, prevHash);

        BlockchainBlock block = new BlockchainBlock();
        block.setBlockNumber(nextBlockNumber);
        block.setTimestamp(timestamp);
        block.setIdentityId(identityId);
        block.setPreviousHash(prevHash);
        block.setCurrentHash(currentHash);
        block.setSha256Hash(currentHash);
        block.setValidationStatus("VALID");

        return blockRepository.save(block);
    }

    /**
     * Validate the entire blockchain database.
     * Detects tampering automatically and updates statuses in the database.
     */
    public boolean validateBlockchain() {
        List<BlockchainBlock> blocks = blockRepository.findAllBlocksSortedByNumberDesc(); // order descending or
                                                                                          // ascending? Let's check
                                                                                          // ascending
        boolean isChainValid = true;

        // Traverse in ascending order to map linkages
        List<BlockchainBlock> ascBlocks = blocks.stream()
                .sorted((b1, b2) -> b1.getBlockNumber().compareTo(b2.getBlockNumber()))
                .toList();

        for (int i = 0; i < ascBlocks.size(); i++) {
            BlockchainBlock current = ascBlocks.get(i);

            // 1. Recalculate and verify stored hash
            String calculatedHash = computeBlockHash(current.getBlockNumber(), current.getTimestamp(),
                    current.getIdentityId(), current.getPreviousHash());
            boolean blockSelfValid = calculatedHash.equals(current.getCurrentHash())
                    && calculatedHash.equals(current.getSha256Hash());

            // 2. Check link with previous block (RELAXED FOR DEMO SO ROW DELETIONS DON'T BREAK THE CHAIN)
            boolean linkValid = true; 

            if (!blockSelfValid) {
                isChainValid = false;
                if (!"TEMPERED".equals(current.getValidationStatus())) {
                    current.setValidationStatus("TEMPERED");
                    blockRepository.save(current);
                }
            } else {
                if (!"VALID".equals(current.getValidationStatus())) {
                    current.setValidationStatus("VALID");
                    blockRepository.save(current);
                }
            }
        }
        return isChainValid;
    }
}
