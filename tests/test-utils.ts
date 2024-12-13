export const mockChainState = {
	nfts: new Map<number, string>(),
	lastTokenId: 0,
	metadata: new Map<number, any>(),
};

export const mockContractCall = async (
	contractName: string,
	functionName: string,
	args: any[],
	sender: string
) => {
	if (contractName === 'artwork-nft') {
		if (functionName === 'mint') {
			if (sender !== 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM') {
				return { success: false, error: 100 }; // err-owner-only
			}
			const tokenId = ++mockChainState.lastTokenId;
			mockChainState.nfts.set(tokenId, sender);
			mockChainState.metadata.set(tokenId, {
				artist: args[0],
				title: args[1],
				creationDate: parseInt(args[2]),
				medium: args[3],
				isPhysical: args[4] === 'true',
				imageUri: args[5],
			});
			return { success: true, value: tokenId };
		}
		if (functionName === 'transfer') {
			const [tokenId, from, to] = args;
			if (mockChainState.nfts.get(tokenId) !== from) {
				return { success: false, error: 100 }; // err-owner-only
			}
			mockChainState.nfts.set(tokenId, to);
			return { success: true };
		}
		if (functionName === 'get-owner') {
			const [tokenId] = args;
			const owner = mockChainState.nfts.get(tokenId);
			return owner ? { success: true, value: owner } : { success: false, error: 101 }; // err-not-found
		}
		if (functionName === 'get-metadata') {
			const [tokenId] = args;
			const metadata = mockChainState.metadata.get(tokenId);
			return metadata ? { success: true, value: metadata } : { success: false, error: 101 }; // err-not-found
		}
		if (functionName === 'get-last-token-id') {
			return { success: true, value: mockChainState.lastTokenId };
		}
	}
	throw new Error(`Unhandled contract call: ${contractName}.${functionName}`);
};

export const mockStxTransfer = async (amount: number, sender: string, recipient: string) => {
	// In a real implementation, you'd check the sender's balance and update balances
	return { success: true };
};

