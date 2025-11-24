/**
 * Currency Exchange Rate Module
 * Uses ExchangeRate-API for real-time currency conversion
 * API Documentation: https://www.exchangerate-api.com/docs
 */

// Cache for exchange rates (1 hour TTL)
const cache = new Map();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour in milliseconds

// Fallback rates (updated November 2025)
const FALLBACK_RATES = {
  USD_ARS: 1400,
  USD_EUR: 0.95,
  USD_BRL: 4.95,
  USD_GBP: 0.79,
  USD_MXN: 17.2,
  USD_COP: 4100,
  USD_CLP: 920,
  ARS_USD: 0.000714,
  EUR_USD: 1.05,
  BRL_USD: 0.20,
  GBP_USD: 1.27,
  MXN_USD: 0.058,
  COP_USD: 0.00024,
  CLP_USD: 0.0011,
};

/**
 * Gets the exchange rate between two currencies
 * Uses ExchangeRate-API with 1-hour caching
 * @param {string} from - Source currency code (e.g., "USD")
 * @param {string} to - Target currency code (e.g., "ARS")
 * @returns {Promise<Object>} { rate: number, from: string, to: string, timestamp: number, source: string }
 */
export async function getExchangeRate(from, to) {
  const fromUpper = from.toUpperCase();
  const toUpper = to.toUpperCase();

  // If currencies are the same, rate is 1
  if (fromUpper === toUpper) {
    return {
      rate: 1,
      from: fromUpper,
      to: toUpper,
      timestamp: Date.now(),
      source: 'same_currency',
    };
  }

  // Check cache first
  const cacheKey = `${fromUpper}_${toUpper}`;
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`📦 Using cached rate for ${fromUpper} → ${toUpper}`);
    return cached;
  }

  // Get API key from environment
  const apiKey = process.env.EXCHANGE_RATE_API_KEY;

  if (!apiKey) {
    console.error('❌ EXCHANGE_RATE_API_KEY not found in environment variables');
    return useFallbackRate(fromUpper, toUpper);
  }

  try {
    // FORMATO CORRECTO: /v6/{api_key}/pair/{from}/{to}
    const url = `https://v6.exchangerate-api.com/v6/${apiKey}/pair/${fromUpper}/${toUpper}`;
    
    console.log(`📡 Fetching exchange rate: ${fromUpper} → ${toUpper}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // ESTRUCTURA CORRECTA: data.result y data.conversion_rate
    if (data.result !== 'success') {
      throw new Error(`API Error: ${data.result} - ${data['error-type'] || 'Unknown error'}`);
    }
    
    if (!data.conversion_rate) {
      throw new Error('No conversion_rate in API response');
    }
    
    const result = {
      rate: data.conversion_rate,
      from: fromUpper,
      to: toUpper,
      timestamp: Date.now(),
      source: 'api',
      lastUpdate: data.time_last_update_utc,
    };
    
    // Store in cache
    cache.set(cacheKey, result);
    
    console.log(`✅ Rate from API: 1 ${fromUpper} = ${data.conversion_rate} ${toUpper}`);
    
    return result;
    
  } catch (error) {
    console.error(`❌ Error fetching exchange rate for ${fromUpper} to ${toUpper}:`, error.message);
    return useFallbackRate(fromUpper, toUpper);
  }
}

/**
 * Uses fallback rate when API fails
 * @private
 */
function useFallbackRate(from, to) {
  // Try direct fallback rate
  const fallbackKey = `${from}_${to}`;
  if (FALLBACK_RATES[fallbackKey]) {
    console.warn(`⚠️  Using fallback rate for ${from} → ${to}: ${FALLBACK_RATES[fallbackKey]}`);
    return {
      rate: FALLBACK_RATES[fallbackKey],
      from,
      to,
      timestamp: Date.now(),
      source: 'fallback',
      fallback: true,
    };
  }
  
  // Try inverse rate
  const inverseKey = `${to}_${from}`;
  if (FALLBACK_RATES[inverseKey]) {
    const inverseRate = 1 / FALLBACK_RATES[inverseKey];
    console.warn(`⚠️  Using inverse fallback rate for ${from} → ${to}: ${inverseRate}`);
    return {
      rate: inverseRate,
      from,
      to,
      timestamp: Date.now(),
      source: 'fallback',
      fallback: true,
    };
  }
  
  // No fallback available - throw error
  throw new Error(
    `❌ No exchange rate available for ${from} → ${to}.\n` +
    `Please add a fallback rate in FALLBACK_RATES or check your API configuration.`
  );
}

/**
 * Converts an amount from one currency to another
 * @param {number} amount - Amount to convert
 * @param {string} fromCurrency - Source currency code
 * @param {string} toCurrency - Target currency code
 * @returns {Promise<number>} Converted amount
 */
export async function convertAmount(amount, fromCurrency, toCurrency) {
  if (fromCurrency.toUpperCase() === toCurrency.toUpperCase()) {
    return amount;
  }
  
  const { rate } = await getExchangeRate(fromCurrency, toCurrency);
  return Math.round(amount * rate * 100) / 100; // Round to 2 decimals
}

/**
 * Converts an expense object to target currency
 * @param {Object} expense - Expense object with amount and currency
 * @param {string} targetCurrency - Target currency code
 * @returns {Promise<Object>} Expense with convertedAmount and targetCurrency
 */
export async function convertExpenseToCurrency(expense, targetCurrency) {
  const { rate, source } = await getExchangeRate(expense.currency, targetCurrency);
  const convertedAmount = Math.round(expense.amount * rate * 100) / 100;
  
  return {
    ...expense,
    convertedAmount,
    targetCurrency,
    exchangeRate: rate,
    exchangeRateSource: source,
  };
}

/**
 * Gets multiple exchange rates at once
 * @param {string} baseCurrency - Base currency code
 * @param {string[]} targetCurrencies - Array of target currency codes
 * @returns {Promise<Object>} Object with currency codes as keys and rates as values
 */
export async function getMultipleRates(baseCurrency, targetCurrencies) {
  const rates = {};
  
  await Promise.all(
    targetCurrencies.map(async (target) => {
      try {
        const result = await getExchangeRate(baseCurrency, target);
        rates[target] = result;
      } catch (error) {
        console.error(`Failed to get rate for ${baseCurrency} → ${target}:`, error.message);
      }
    })
  );
  
  return rates;
}

/**
 * Checks API quota status
 * @returns {Promise<Object|null>} Quota information or null if error
 */
export async function checkAPIQuota() {
  const apiKey = process.env.EXCHANGE_RATE_API_KEY;

  if (!apiKey) {
    console.error('❌ EXCHANGE_RATE_API_KEY not configured');
    return null;
  }

  try {
    const url = `https://v6.exchangerate-api.com/v6/${apiKey}/quota`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    return {
      planType: data.plan_type,
      requestsRemaining: data.requests_remaining,
      requestsLimit: data.requests_limit,
      requestsThisMonth: data.requests_limit - data.requests_remaining,
    };
  } catch (error) {
    console.error('Error checking API quota:', error.message);
    return null;
  }
}

/**
 * Clears the exchange rate cache
 * Useful for testing or forcing fresh rates
 */
export function clearCache() {
  cache.clear();
  console.log('🗑️  Exchange rate cache cleared');
}