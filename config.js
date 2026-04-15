// config.js

// Sandan'ny Dolara amin'ny Ariary (ovay eto raha hiova ny cours eo amin'ny tsena)
export let USD_TO_MGA = 4700; 

// Lisitry ny Assets sy ny frais (Static)
export const ASSETS_DATA = {
    crypto: [
        { val: 'BTCUSDT', txt: 'Bitcoin (BTC)', icon: "https://cryptologos.cc/logos/bitcoin-btc-logo.svg", frais: 0.04 },
        { val: 'TRXUSDT', txt: 'TRX (TRC20)', icon: "https://cryptologos.cc/logos/tron-trx-logo.svg", frais: 0.02 },
        { val: 'USDT',    txt: 'USDT (TRC20)', icon: "https://cryptologos.cc/logos/tether-usdt-logo.svg", frais: 0.03 }
    ],
    wallet: [
        { val: 'PAYPAL', txt: 'PayPal', icon: "https://www.vectorlogo.zone/logos/paypal/paypal-icon.svg", frais: 0.05 },
        { val: 'SKRILL', txt: 'Skrill', icon: "https://www.vectorlogo.zone/logos/skrill/skrill-icon.svg", frais: 0.05 }
    ],
    betting: [
        { val: '1XBET', txt: '1xBet', icon: "https://upload.wikimedia.org/wikipedia/commons/1/14/1xBet_logo.svg", frais: 0.01 }
    ]
};

// Ity no hitahiry ny prix farany avy amin'ny API
export let CURRENT_TAUX = {
    "BTCUSDT": 300000000,
    "TRXUSDT": 600,
    "USDT": 4700,
    "1XBET": 1,
    "PAYPAL": 4500
};
