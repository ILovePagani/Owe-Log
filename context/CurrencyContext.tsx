import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { loadCurrencySymbol, saveCurrencySymbol } from '@/storage/currency';

export const CURRENCY_OPTIONS: { symbol: string; label: string }[] = [
  { symbol: '$',  label: '$ — US Dollar'        },
  { symbol: '€',  label: '€ — Euro'              },
  { symbol: '£',  label: '£ — British Pound'     },
  { symbol: '¥',  label: '¥ — Japanese Yen'      },
  { symbol: '₹',  label: '₹ — Indian Rupee'      },
  { symbol: '₩',  label: '₩ — Korean Won'        },
  { symbol: 'A$', label: 'A$ — Australian Dollar'},
  { symbol: 'C$', label: 'C$ — Canadian Dollar'  },
  { symbol: 'R',  label: 'R — South African Rand'},
  { symbol: '₦',  label: '₦ — Nigerian Naira'    },
  { symbol: 'kr', label: 'kr — Swedish Krona'    },
  { symbol: 'CHF',label: 'CHF — Swiss Franc'     },
];

interface CurrencyContextValue {
  symbol: string;
  setSymbol: (symbol: string) => Promise<void>;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [symbol, setSymbolState] = useState('$');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadCurrencySymbol().then((saved) => {
      setSymbolState(saved);
      setLoaded(true);
    });
  }, []);

  const setSymbol = useCallback(async (next: string) => {
    setSymbolState(next);
    await saveCurrencySymbol(next);
  }, []);

  const value = useMemo(() => ({ symbol, setSymbol }), [symbol, setSymbol]);

  if (!loaded) return null;

  return (
    <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
  );
}

export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
}
