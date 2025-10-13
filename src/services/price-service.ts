// Service for fetching real-time token prices from multiple sources

interface TokenPrice {
  usd: number;
  lastUpdated: number;
}

interface PriceData {
  [tokenSymbol: string]: TokenPrice;
}

/**
 * Price Service - Fetches real-time token prices
 * Data sources: CoinGecko, Ref Finance, fallback to cached prices
 */
export class PriceService {
  private cache: PriceData = {};
  private cacheExpiry: number = 60000; // 1 minute cache
  private lastFetch: number = 0;

  // CoinGecko IDs for tokens
  private coinGeckoIds: Record<string, string> = {
    NEAR: 'near',
    WNEAR: 'near', // wNEAR has same price as NEAR
    WETH: 'ethereum',
    WBTC: 'bitcoin',
    USDC: 'usd-coin',
    USDT: 'tether',
    DAI: 'dai',
  };

  /**
   * Get current prices for all tokens (in USD)
   */
  async getPrices(): Promise<PriceData> {
    // Return cached data if still fresh
    const now = Date.now();
    if (now - this.lastFetch < this.cacheExpiry && Object.keys(this.cache).length > 0) {
      console.log('📊 Using cached prices');
      return this.cache;
    }

    try {
      console.log('🔄 Fetching live prices from CoinGecko...');
      
      // Fetch from CoinGecko (free tier, no API key needed)
      const ids = Object.values(this.coinGeckoIds).join(',');
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`,
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        console.warn(`CoinGecko API error (${response.status}), using fallback prices`);
        const fallback = this.getFallbackPrices();
        this.cache = fallback;
        this.lastFetch = now;
        return fallback;
      }

      const data = await response.json();
      
      // Transform to our format
      const prices: PriceData = {};
      for (const [symbol, geckoId] of Object.entries(this.coinGeckoIds)) {
        if (data[geckoId]?.usd) {
          prices[symbol] = {
            usd: data[geckoId].usd,
            lastUpdated: now,
          };
        }
      }

      // Add wNEAR (same as NEAR)
      if (prices.NEAR) {
        prices.WNEAR = prices.NEAR;
      }

      // If no prices were fetched, use fallback
      if (Object.keys(prices).length === 0) {
        console.warn('No prices received from API, using fallback');
        const fallback = this.getFallbackPrices();
        this.cache = fallback;
        this.lastFetch = now;
        return fallback;
      }

      this.cache = prices;
      this.lastFetch = now;
      
      console.log('✅ Live prices fetched:', Object.keys(prices).length, 'tokens');
      return prices;

    } catch (error) {
      console.error('Error fetching prices:', error);
      const fallback = this.getFallbackPrices();
      this.cache = fallback;
      this.lastFetch = now;
      return fallback;
    }
  }

  /**
   * Get exchange rate between two tokens
   */
  async getExchangeRate(fromSymbol: string, toSymbol: string): Promise<number> {
    try {
      const prices = await this.getPrices();
      
      // Safe logging with null checks
      if (prices && typeof prices === 'object') {
        const priceList = Object.keys(prices)
          .filter(k => prices[k]?.usd)
          .map(k => `${k}=$${prices[k].usd.toFixed(2)}`)
          .join(', ');
        console.log(`📊 Available prices: ${priceList}`);
      }
      
      const fromPrice = prices?.[fromSymbol]?.usd || 0;
      const toPrice = prices?.[toSymbol]?.usd || 1;

      console.log(`💰 ${fromSymbol} price: $${fromPrice}`);
      console.log(`💰 ${toSymbol} price: $${toPrice}`);

      if (fromPrice === 0 || toPrice === 0) {
        console.warn(`⚠️ Missing price for ${fromSymbol} or ${toSymbol}, using fallback`);
        return this.getFallbackExchangeRate(fromSymbol, toSymbol);
      }

      // Calculate exchange rate
      const rate = fromPrice / toPrice;
      
      console.log(`💱 Exchange rate: 1 ${fromSymbol} = ${rate.toFixed(4)} ${toSymbol} ($${fromPrice}/$${toPrice})`);
      return rate;

    } catch (error) {
      console.error('Error calculating exchange rate:', error);
      return this.getFallbackExchangeRate(fromSymbol, toSymbol);
    }
  }

  /**
   * Fallback prices when API is unavailable
   * These are approximate values as of Oct 2025
   */
  private getFallbackPrices(): PriceData {
    console.log('⚠️ Using fallback prices (approximate market rates as of Oct 2025)');
    
    const now = Date.now();
    return {
      NEAR: { usd: 2.40, lastUpdated: now },
      WNEAR: { usd: 2.40, lastUpdated: now },
      USDC: { usd: 1.00, lastUpdated: now },
      USDT: { usd: 1.00, lastUpdated: now },
      DAI: { usd: 1.00, lastUpdated: now },
      WETH: { usd: 2600.00, lastUpdated: now },
      WBTC: { usd: 67000.00, lastUpdated: now },
    };
  }

  /**
   * Fallback exchange rates
   */
  private getFallbackExchangeRate(fromSymbol: string, toSymbol: string): number {
    const prices = this.getFallbackPrices();
    const fromPrice = prices[fromSymbol]?.usd || 1;
    const toPrice = prices[toSymbol]?.usd || 1;
    return fromPrice / toPrice;
  }

  /**
   * Get price for a single token
   */
  async getTokenPrice(symbol: string): Promise<number> {
    const prices = await this.getPrices();
    return prices[symbol]?.usd || 0;
  }

  /**
   * Check if prices are fresh
   */
  arePricesFresh(): boolean {
    return Date.now() - this.lastFetch < this.cacheExpiry;
  }

  /**
   * Force refresh prices
   */
  async refreshPrices(): Promise<PriceData> {
    this.lastFetch = 0; // Invalidate cache
    return await this.getPrices();
  }
}

// Export singleton instance
export const priceService = new PriceService();

