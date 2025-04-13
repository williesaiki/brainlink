import axios from 'axios';

export interface CurrencyRate {
  code: string;
  rate: number;
  change: number;
}

const API_URL = 'https://api.nbp.pl/api/exchangerates/tables/A?format=json';

export const currencyService = {
  async getRates(): Promise<CurrencyRate[]> {
    try {
      const response = await axios.get(API_URL);
      const rates = response.data[0].rates;
      
      // Get only major currencies
      const majorCurrencies = ['EUR', 'USD', 'GBP', 'CHF'];
      return rates
        .filter((rate: any) => majorCurrencies.includes(rate.code))
        .map((rate: any) => ({
          code: rate.code,
          rate: rate.mid,
          // Simulate change for now since NBP API doesn't provide it
          change: (Math.random() * 2 - 1) * 0.5
        }));
    } catch (error) {
      console.error('Error fetching currency rates:', error);
      return [];
    }
  }
};