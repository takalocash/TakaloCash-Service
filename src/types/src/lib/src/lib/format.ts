/** Format a number as MGA Ariary */
export const fmtAr = (n: number) =>
  n.toLocaleString('fr-FR', { maximumFractionDigits: 0 }) + ' Ar';
  
  /** Format crypto amount with up to 8 decimals, trimming trailing zeros */
  export const fmtCrypto = (n: number, sym: string) =>
    n.toLocaleString('en-US', { maximumFractionDigits: 8 }) + ' ' + sym;
    
    /** Format countdown seconds as MM:SS */
    export const fmtCountdown = (seconds: number): string => {
      const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
          return `${m}:${s}`;
          };
          
          /** Reputation badge color */
          export const reputationColor = (rep: number): string =>
            rep >= 95 ? 'text-green-400' : rep >= 80 ? 'text-yellow-400' : 'text-red-400';
            
            /** Payment method logo placeholder */
            export const PAYMENT_COLORS: Record<string, string> = {
              'Mvola':        '#f5c518',
                'Orange Money': '#FF7900',
                  'Airtel Money': '#E40026',
                    'Bank Transfer':'#60a5fa',
                    };
                    
                    export const CURRENCIES = ['USDT', 'TRX', 'BTC', 'ETH', 'BNB', 'SOL'];
                    export const PAYMENT_METHODS = ['Mvola', 'Orange Money', 'Airtel Money', 'Bank Transfer'] as const; */