import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mockChainState, mockContractCall, mockStxTransfer } from './test-utils';

describe('Artwork NFT Contract', () => {
  const contractName = 'artwork-nft';
  const contractAddress = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
  const contractOwner = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
  const user1 = 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG';
  const user2 = 'ST3AM1A56AK2C1XAFJ4115ZSV26EB49BVQ10MGCS0';
  
  beforeEach(() => {
    mockChainState.nfts.clear();
    mockChainState.lastTokenId = 0;
    mockChainState.metadata.clear();
  });
  
  describe('mint', () => {
    it('should successfully mint a new artwork NFT', async () => {
      const result = await mockContractCall(
          contractName,
          'mint',
          [
            'Pablo Picasso',
            'Guernica',
            '1937',
            'Oil on canvas',
            'true',
            'https://example.com/guernica.jpg'
          ],
          contractOwner
      );
      
      expect(result).toEqual({ success: true, value: 1 });
      expect(mockChainState.nfts.get(1)).toBe(contractOwner);
      expect(mockChainState.metadata.get(1)).toEqual({
        artist: 'Pablo Picasso',
        title: 'Guernica',
        creationDate: 1937,
        medium: 'Oil on canvas',
        isPhysical: true,
        imageUri: 'https://example.com/guernica.jpg'
      });
    });
    
    it('should fail to mint if not contract owner', async () => {
      const result = await mockContractCall(
          contractName,
          'mint',
          [
            'Claude Monet',
            'Water Lilies',
            '1919',
            'Oil on canvas',
            'true',
            'https://example.com/water-lilies.jpg'
          ],
          user1
      );
      
      expect(result).toEqual({ success: false, error: 100 }); // err-owner-only
    });
  });
  
  describe('transfer', () => {
    it('should successfully transfer an artwork NFT', async () => {
      await mockContractCall(
          contractName,
          'mint',
          [
            'Vincent van Gogh',
            'The Starry Night',
            '1889',
            'Oil on canvas',
            'true',
            'https://example.com/starry-night.jpg'
          ],
          contractOwner
      );
      
      const result = await mockContractCall(
          contractName,
          'transfer',
          [1, contractOwner, user1],
          contractOwner
      );
      
      expect(result).toEqual({ success: true });
      expect(mockChainState.nfts.get(1)).toBe(user1);
    });
  });
  
  describe('get-owner', () => {
    it('should return the correct owner of an artwork NFT', async () => {
      await mockContractCall(
          contractName,
          'mint',
          [
            'Rembrandt',
            'The Night Watch',
            '1642',
            'Oil on canvas',
            'true',
            'https://example.com/night-watch.jpg'
          ],
          contractOwner
      );
      
      const result = await mockContractCall(
          contractName,
          'get-owner',
          [1],
          user1
      );
      
      expect(result).toEqual({ success: true, value: contractOwner });
    });
    
    it('should fail for non-existent token', async () => {
      const result = await mockContractCall(
          contractName,
          'get-owner',
          [999],
          user1
      );
      
      expect(result).toEqual({ success: false, error: 101 }); // err-not-found
    });
  });
  
  describe('get-metadata', () => {
    it('should return the correct metadata for an artwork NFT', async () => {
      await mockContractCall(
          contractName,
          'mint',
          [
            'Salvador Dali',
            'The Persistence of Memory',
            '1931',
            'Oil on canvas',
            'true',
            'https://example.com/persistence-of-memory.jpg'
          ],
          contractOwner
      );
      
      const result = await mockContractCall(
          contractName,
          'get-metadata',
          [1],
          user1
      );
      
      expect(result).toEqual({
        success: true,
        value: {
          artist: 'Salvador Dali',
          title: 'The Persistence of Memory',
          creationDate: 1931,
          medium: 'Oil on canvas',
          isPhysical: true,
          imageUri: 'https://example.com/persistence-of-memory.jpg'
        }
      });
    });
    
    it('should fail for non-existent token', async () => {
      const result = await mockContractCall(
          contractName,
          'get-metadata',
          [999],
          user1
      );
      
      expect(result).toEqual({ success: false, error: 101 }); // err-not-found
    });
  });
  
  describe('get-last-token-id', () => {
    it('should return the correct last token ID', async () => {
      await mockContractCall(
          contractName,
          'mint',
          [
            'Frida Kahlo',
            'The Two Fridas',
            '1939',
            'Oil on canvas',
            'true',
            'https://example.com/two-fridas.jpg'
          ],
          contractOwner
      );
      
      await mockContractCall(
          contractName,
          'mint',
          [
            'Andy Warhol',
            'Campbell\'s Soup Cans',
            '1962',
            'Synthetic polymer paint on canvas',
            'true',
            'https://example.com/campbells-soup-cans.jpg'
          ],
          contractOwner
      );
      
      const result = await mockContractCall(
          contractName,
          'get-last-token-id',
          [],
          user1
      );
      
      expect(result).toEqual({ success: true, value: 2 });
    });
  });
});

