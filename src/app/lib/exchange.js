/**
 * Currency Exchange Rate Module
 * Uses exchangerate.host API for real-time currency conversion
 * API Documentation: https://exchangerate.host/
 */

// Cache for exchange rates (1 hour TTL)
const cache = new Map();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour in milliseconds

// Fallback rates in case API fails
const FALLBACK_RATES = {
  USD_ARS: 950,
  USD_EUR: 0.92,
  USD_BRL: 4.95,
  ARS_USD: 0.00105,
  EUR_USD: 1.09,
  BRL_USD: 0.20,
};

/**
 * Gets the exchange rate between two currencies
 * Uses exchangerate.host API with 1-hour caching
 * @param {string} from - Source currency code (e.g., "USD")
 * @param {string} to - Target currency code (e.g., "ARS")
 * @returns {Promise<Object>} { rate: number, from: string, to: string, timestamp: number }
 */
export async function getExchangeRate(from, to) {
  // If currencies are the same, rate is 1
  if (from === to) {
    return {
      rate: 1,
      from,
      to,
      timestamp: Date.now(),
    };
  }

  // Check cache first
  const cacheKey = `${from}_${to}`;
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached;
  }

  try {
    // Call exchangerate.host API
    const url = `https://api.exchangerate.host/latest?base=${from}&symbols=${to}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success || !data.rates || !data.rates[to]) {
      throw new Error("Invalid API response");
    }
    
    const rate = data.rates[to];
    const result = {
      rate,
      from,
      to,
      timestamp: Date.now(),
    };
    
    // Store in cache
    cache.set(cacheKey, result);
    
    return result;
    
  } catch (error) {
    console.error(`Error fetching exchange rate for ${from} to ${to}:`, error.message);
    
    // Use fallback rate if available
    const fallbackKey = `${from}_${to}`;
    if (FALLBACK_RATES[fallbackKey]) {
      console.warn(`Using fallback rate for ${from} to ${to}`);
      return {
        rate: FALLBACK_RATES[fallbackKey],
        from,
        to,
        timestamp: Date.now(),
        fallback: true,
      };
    }
    
    // If no fallback, try inverse rate
    const inverseKey = `${to}_${from}`;
    if (FALLBACK_RATES[inverseKey]) {
      console.warn(`Using inverse fallback rate for ${from} to ${to}`);
      return {
        rate: 1 / FALLBACK_RATES[inverseKey],
        from,
        to,
        timestamp: Date.now(),
        fallback: true,
      };
    }
    
    // Last resort: return 1 (no conversion)
    console.warn(`No exchange rate available for ${from} to ${to}, using 1:1`);
    return {
      rate: 1,
      from,
      to,
      timestamp: Date.now(),
      error: true,
    };
  }
}

/**
 * Converts an amount from one currency to another
 * @param {number} amount - Amount to convert
 * @param {string} fromCurrency - Source currency code
 * @param {string} toCurrency - Target currency code
 * @returns {Promise<number>} Converted amount
 */
export async function convertAmount(amount, fromCurrency, toCurrency) {
  if (fromCurrency === toCurrency) {
    return amount;
  }
  
  const { rate } = await getExchangeRate(fromCurrency, toCurrency);
  return amount * rate;
}

/**
 * Converts an expense object to target currency
 * @param {Object} expense - Expense object with amount and currency
 * @param {string} targetCurrency - Target currency code
 * @returns {Promise<Object>} Expense with convertedAmount and targetCurrency
 */
export async function convertExpenseToCurrency(expense, targetCurrency) {
  const convertedAmount = await convertAmount(
    expense.amount,
    expense.currency,
    targetCurrency
  );
  
  return {
    ...expense,
    convertedAmount,
    targetCurrency,
  };
}

/**
 * Clears the exchange rate cache
 * Useful for testing or forcing fresh rates
 */
export function clearCache() {
  cache.clear();
}

