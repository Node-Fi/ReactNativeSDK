export let PRICE_REFETCH_INTERVAL = 30 * 1000;

export const setPriceRefetchInterval = (newInterval: number) =>
  (PRICE_REFETCH_INTERVAL = newInterval);

export let SWAP_QUOTE_REFETCH_INTERVAL = 5 * 1000;

export const setSwapQuoteRefetchInterval = (newInterval: number) =>
  (SWAP_QUOTE_REFETCH_INTERVAL = newInterval);
