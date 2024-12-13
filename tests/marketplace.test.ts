import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock in-memory state
const mockState = {
  listings: {} as Record<number, { seller: string; price: number; isActive: boolean }>,
};

// Mock contract calls
const mockContractCall = vi.fn((functionName: string, args: any[], sender: string) => {
  switch (functionName) {
    case 'list-artwork':
      const [tokenId, price] = args;
      mockState.listings[tokenId] = { seller: sender, price, isActive: true };
      return { success: true };
    case 'unlist-artwork':
      const [unlistTokenId] = args;
      if (!mockState.listings[unlistTokenId]) {
        return { success: false, error: 101 }; // err-not-found
      }
      if (mockState.listings[unlistTokenId].seller !== sender) {
        return { success: false, error: 102 }; // err-unauthorized
      }
      mockState.listings[unlistTokenId].isActive = false;
      return { success: true };
    case 'buy-artwork':
      const [buyTokenId] = args;
      if (!mockState.listings[buyTokenId] || !mockState.listings[buyTokenId].isActive) {
        return { success: false, error: 101 }; // err-not-found
      }
      delete mockState.listings[buyTokenId];
      return { success: true };
    case 'get-listing':
      const [getTokenId] = args;
      return mockState.listings[getTokenId]
          ? { success: true, value: mockState.listings[getTokenId] }
          : { success: false, error: 101 }; // err-not-found
    default:
      throw new Error(`Unhandled function: ${functionName}`);
  }
});

describe('Marketplace Contract', () => {
  const user1 = 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG';
  const user2 = 'ST3AM1A56AK2C1XAFJ4115ZSV26EB49BVQ10MGCS0';
  
  beforeEach(() => {
    mockState.listings = {};
    vi.clearAllMocks();
  });
  
  describe('list-artwork', () => {
    it('should successfully list an artwork', () => {
      const result = mockContractCall('list-artwork', [1, 1000000], user1);
      
      expect(result).toEqual({ success: true });
      expect(mockState.listings[1]).toEqual({
        seller: user1,
        price: 1000000,
        isActive: true
      });
    });
  });
  
  describe('unlist-artwork', () => {
    it('should successfully unlist an artwork', () => {
      mockContractCall('list-artwork', [1, 1000000], user1);
      const result = mockContractCall('unlist-artwork', [1], user1);
      
      expect(result).toEqual({ success: true });
      expect(mockState.listings[1].isActive).toBe(false);
    });
    
    it('should fail to unlist if not the seller', () => {
      mockContractCall('list-artwork', [1, 1000000], user1);
      const result = mockContractCall('unlist-artwork', [1], user2);
      
      expect(result).toEqual({ success: false, error: 102 }); // err-unauthorized
    });
    
    it('should fail to unlist a non-existent listing', () => {
      const result = mockContractCall('unlist-artwork', [999], user1);
      
      expect(result).toEqual({ success: false, error: 101 }); // err-not-found
    });
  });
  
  describe('buy-artwork', () => {
    it('should successfully buy an artwork', () => {
      mockContractCall('list-artwork', [1, 1000000], user1);
      const result = mockContractCall('buy-artwork', [1], user2);
      
      expect(result).toEqual({ success: true });
      expect(mockState.listings[1]).toBeUndefined();
    });
    
    it('should fail to buy an unlisted artwork', () => {
      const result = mockContractCall('buy-artwork', [999], user2);
      
      expect(result).toEqual({ success: false, error: 101 }); // err-not-found
    });
    
    it('should fail to buy an inactive listing', () => {
      mockContractCall('list-artwork', [1, 1000000], user1);
      mockContractCall('unlist-artwork', [1], user1);
      const result = mockContractCall('buy-artwork', [1], user2);
      
      expect(result).toEqual({ success: false, error: 101 }); // err-not-found (inactive listing)
    });
  });
  
  describe('get-listing', () => {
    it('should return the correct listing information', () => {
      mockContractCall('list-artwork', [1, 1000000], user1);
      const result = mockContractCall('get-listing', [1], user2);
      
      expect(result).toEqual({
        success: true,
        value: {
          seller: user1,
          price: 1000000,
          isActive: true
        }
      });
    });
    
    it('should fail for a non-existent listing', () => {
      const result = mockContractCall('get-listing', [999], user2);
      
      expect(result).toEqual({ success: false, error: 101 }); // err-not-found
    });
  });
});

