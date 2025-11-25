/**
 * Currency Exchange Rate Module
 * Uses exchangerate.host API for real-time currency conversion
 * API Documentation: https://exchangerate.host/
 */

// Cache for exchange rates (1 hour TTL)
const cache = new Map();
//const CACHE_TTL = 60 * 60 * 1000; // 1 hour in milliseconds
const CACHE_TTL = 8 * 60 * 60 * 1000; // 8 hours in milliseconds... 1 hour is WAY too low when you have only 100 free requests a month 3 times a day, 30 days is 90...

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
  
  const exchangeRates = await getUpdatedUSDRates();

  //console.log("===========================exchangeRates====================")
  //console.log(exchangeRates);

  if (to != "USD" && exchangeRates.to.indexOf(to) == -1)
  {
    throw new Error("No exchange rate for currency TO:"+to);
  }
  if (from != "USD" && exchangeRates.to.indexOf(from) == -1)
  {
    throw new Error("No exchange rate for currency FROM:"+from);
  }
  var USDto = 1;
  var USDfrom = 1;

  if (to != "USD")
  {
    USDto = exchangeRates.rate[exchangeRates.to.indexOf(to)];
  }
  if (from != "USD")
  {
    USDfrom = exchangeRates.rate[exchangeRates.to.indexOf(from)];
  }

  return {
      rate: USDto/USDfrom,
      from,
      to,
      timestamp: exchangeRates.timestamp,
    };

  
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

// PLEASE DON'T HATE ME, I'M SORRY!!!
import { readDB, writeDB } from "./db.js";

/**
 * Gets an "updated" exchange rates for all USD-XXX
 * This calls the API, at most once every 8 hours. This limit is to not overuse the API.
 */
export async function getUpdatedUSDRates() {
  const db = await readDB();

  //console.log("=============================DB.EXCHANGE======================")
  //console.log(db.exchangeRates);

  if (db.exchangeRates && Date.now() - db.exchangeRates.timestamp < CACHE_TTL) {
    return db.exchangeRates;
  }

  console.log("Exchange rates updated!!! Timestamp="+Date.now());

  try {
    // Another horrible thing... But this HAS to work, right?
    const currencies = ["ARS","EUR","BRL","GBP","JPY","MXN","CLP","COP","UYU"];
    // Call exchangerate.host API
    // THIS ACCESSKEY HERE IS AWFUL, BUT WELL...
    const accessKey = "117eba3a86ceb1befbae2090c850fb87"
    //BUUUUT this one gets ALL exchanges... but only from USD
    const url = `http://api.exchangerate.host/live?access_key=${accessKey}&currencies=${currencies.toString()}&format=1`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }
    
    const data = await response.json();
    
    // We can validate a bit... not really expecting this to break
    if (!data.success || !data.quotes) {
      throw new Error("Invalid API response");
    }

    var rates = [];
    currencies.forEach(function(currency, index){
      rates[index] = data.quotes["USD"+currencies[index]]
    });

    db.exchangeRates = {
      rate: rates,
      to: currencies,
      timestamp: Date.now()
    }

    await writeDB(db);

    return db.exchangeRates;
  } catch (error) {
    // PLEASE.... just don't break (pleading with a lot of duct tape and faith)
    console.error(`Error fetching exchange rates:`, error.message);
  }
}

