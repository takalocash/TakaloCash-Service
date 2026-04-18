// config.js

export let USD_TO_MGA = 4700; 

// 1. ADDR_RECEPT: Ny adiresinao handraisana vola
export const ADDR_RECEPT = {
    'TRX': 'ADRESSE_TRON_NAO_ETO',
    'USDT': 'ADRESSE_USDT_TRC20_NAO_ETO',
    'BTC': 'ADRESSE_BITCOIN_NAO_ETO',
    'PAYPAL': 'email-paypal@gmail.com',
    '1XBET': 'ID_1XBET_NAO'
};

// 2. ASSETS_DATA: Ny mombamomba ny asset rehetra
export const ASSETS_DATA = {
    crypto: [
        { val: 'BTC', txt: 'Bitcoin (BTC)', icon: "https://cryptologos.cc/logos/bitcoin-btc-logo.svg", frais: 0.04 },
        { val: 'TRX', txt: 'TRX (TRC20)', icon: "https://cryptologos.cc/logos/tron-trx-logo.svg", frais: 0.02 },
        { val: 'USDT', txt: 'USDT (TRC20)', icon: "https://cryptologos.cc/logos/tether-usdt-logo.svg", frais: 0.03 }
    ],
    wallet: [
        { val: 'PAYPAL', txt: 'PayPal', icon: "https://www.vectorlogo.zone/logos/paypal/paypal-icon.svg", frais: 0.05 },
        { val: 'SKRILL', txt: 'Skrill', icon: "https://www.vectorlogo.zone/logos/skrill/skrill-icon.svg", frais: 0.05 }
    ],
    betting: [
        { val: '1XBET', txt: '1xBet', icon: "https://upload.wikimedia.org/wikipedia/commons/1/14/1xBet_logo.svg", frais: 0.01 }
    ],
    abonnement: [
        { val: 'NETFLIX', txt: 'Netflix', icon: "https://www.cdnlogo.com/logos/n/82/netflix-n.svg", frais: 0.02 }
    ]
};

// 3. CURRENT_TAUX: Ity no havaozin'ny API Binance
export let CURRENT_TAUX = {
    "BTC": 300000000,
    "TRX": 600,
    "USDT": 4700,
    "1XBET": 1,
    "PAYPAL": 4500
};

// 4. Fonction fakana taux automatique (Binance)
export async function updateTauxBinance() {
    try {
        const response = await fetch("https://api.binance.com/api/v3/ticker/price?symbols=[%22BTCUSDT%22,%22TRXUSDT%22]");
        const data = await response.json();

        data.forEach(item => {
            if (item.symbol === "BTCUSDT") CURRENT_TAUX["BTC"] = Math.round(parseFloat(item.price) * USD_TO_MGA);
            if (item.symbol === "TRXUSDT") CURRENT_TAUX["TRX"] = Math.round(parseFloat(item.price) * USD_TO_MGA);
        });
        
        CURRENT_TAUX["USDT"] = USD_TO_MGA;
        console.log("Taux Binance mis à jour ✅");
    } catch (err) {
        console.warn("Erreur API Binance, utilisation des taux par défaut.");
    }
}
