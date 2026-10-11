import { createContext, useCallback, useContext, useState } from 'react';
import { quotes } from '../data/quotes.js';

const Ctx = createContext(null);

// A fresh quote on every visit, never the same one twice in a row.
const pickForVisit = () => {
  let last = -1;
  try { last = Number(localStorage.getItem('quote:last') ?? -1); } catch { /* storage unavailable */ }
  let n;
  do { n = Math.floor(Math.random() * quotes.length); } while (n === last && quotes.length > 1);
  try { localStorage.setItem('quote:last', String(n)); } catch { /* storage unavailable */ }
  return n;
};

export function QuoteProvider({ children }) {
  const [index, setIndex] = useState(pickForVisit);
  const [tick, setTick] = useState(0);

  const next = useCallback(() => {
    let nextQuote = null;
    setIndex((i) => {
      let n;
      do { n = Math.floor(Math.random() * quotes.length); } while (n === i && quotes.length > 1);
      nextQuote = quotes[n];
      return n;
    });
    setTick((t) => t + 1);
    return nextQuote;
  }, []);

  return <Ctx.Provider value={{ quote: quotes[index], tick, next }}>{children}</Ctx.Provider>;
}

export const useQuote = () => useContext(Ctx);
