import { NextResponse } from 'next/server';

// This API route will fetch top holders using Helius or Moralis
// TODO: Add your API key in .env.local:
// HELIUS_API_KEY=your_helius_api_key
// or
// MORALIS_API_KEY=your_moralis_api_key

interface HolderData {
  address: string;
  balance: string;
  percentage: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const contractAddress = searchParams.get('contract');

  if (!contractAddress) {
    return NextResponse.json(
      { success: false, error: 'Contract address required' },
      { status: 400 }
    );
  }

  try {
    // Option 1: Helius API
    // Uncomment and configure when ready:
    /*
    const HELIUS_API_KEY = process.env.HELIUS_API_KEY;
    if (!HELIUS_API_KEY) {
      throw new Error('HELIUS_API_KEY not configured');
    }

    const response = await fetch(
      `https://api.helius.xyz/v0/token-metadata?api-key=${HELIUS_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mintAccounts: [contractAddress],
          includeOffChain: true,
          disableCache: false,
        }),
      }
    );

    const data = await response.json();
    
    // Fetch token holders
    const holdersResponse = await fetch(
      `https://api.helius.xyz/v0/addresses/${contractAddress}/balances?api-key=${HELIUS_API_KEY}`
    );
    
    const holdersData = await holdersResponse.json();
    
    // Process and format top 10 holders
    const totalSupply = 1000000000; // 1B tokens
    const holders: HolderData[] = holdersData
      .sort((a: any, b: any) => b.amount - a.amount)
      .slice(0, 10)
      .map((holder: any) => ({
        address: holder.address,
        balance: (holder.amount / 1e9).toLocaleString(), // Adjust decimals as needed
        percentage: ((holder.amount / totalSupply) * 100).toFixed(2) + '%',
      }));

    return NextResponse.json({ success: true, holders });
    */

    // Option 2: Moralis API
    // Uncomment and configure when ready:
    /*
    const MORALIS_API_KEY = process.env.MORALIS_API_KEY;
    if (!MORALIS_API_KEY) {
      throw new Error('MORALIS_API_KEY not configured');
    }

    const response = await fetch(
      `https://solana-gateway.moralis.io/token/mainnet/${contractAddress}/holders`,
      {
        headers: {
          'X-API-Key': MORALIS_API_KEY,
        },
      }
    );

    const data = await response.json();
    
    const totalSupply = 1000000000; // 1B tokens
    const holders: HolderData[] = data.result
      .slice(0, 10)
      .map((holder: any) => ({
        address: holder.owner,
        balance: parseFloat(holder.balance).toLocaleString(),
        percentage: ((parseFloat(holder.balance) / totalSupply) * 100).toFixed(2) + '%',
      }));

    return NextResponse.json({ success: true, holders });
    */

    // Placeholder response until APIs are configured
    return NextResponse.json({
      success: false,
      message: 'Token not deployed yet. API integration ready for when contract is live.',
      holders: [],
    });

  } catch (error) {
    console.error('Error fetching token holders:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch holder data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
