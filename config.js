// =============================================================
// config.js — TakaloCash Premium · Central configuration file
// =============================================================

// 1. USD → MGA exchange rate (update manually or via updateTaux())
export let USD_TO_MGA = 4700;

// 2. Reception addresses (your personal addresses for the "Receive" flow)
export const ADDR_RECEPT = {
    'TRX':    'YOUR_TRON_ADDRESS_HERE',
    'USDT':   'YOUR_USDT_TRC20_ADDRESS_HERE',
    'BTC':    'YOUR_BITCOIN_ADDRESS_HERE',
    'PAYPAL': 'your-email@paypal.com',
    '1XBET':  'YOUR_1XBET_ID'
};

// 3. Assets data — one entry per category
//    title         : displayed in the transaction form header
//    label         : label for the address/ID input field
//    allowRecevoir : whether the "Receive" button is enabled
//    items[]       : val (DB key), txt (dropdown label), icon (URL), frais (fee 0–1)
export const ASSETS_DATA = {
    crypto: {
        title:         "Crypto Transaction",
        label:         "Destination address:",
        allowRecevoir: true,
        items: [
            { val: 'BTC',  txt: 'Bitcoin (BTC)', icon: "https://cryptologos.cc/logos/bitcoin-btc-logo.svg",  frais: 0.04 },
            { val: 'TRX',  txt: 'TRX (TRC20)',   icon: "https://cryptologos.cc/logos/tron-trx-logo.svg",    frais: 0.02 },
            { val: 'USDT', txt: 'USDT (TRC20)',  icon: "https://cryptologos.cc/logos/tether-usdt-logo.svg", frais: 0.03 }
        ]
    },
    wallet: {
        title:         "Wallet Transfer",
        label:         "Email or Wallet ID:",
        allowRecevoir: true,
        // FIX: vectorlogo.zone URLs replaced with reliable Wikimedia sources
        items: [
            { val: 'PAYPAL', txt: 'PayPal', icon: "https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg",      frais: 0.05 },
            { val: 'SKRILL', txt: 'Skrill', icon: "https://upload.wikimedia.org/wikipedia/commons/8/8b/Skrill_logo.svg", frais: 0.05 },
            { val: 'PAYEER', txt: 'Payeer', icon: "https://via.placeholder.com/22?text=PE",                              frais: 0.04 }
        ]
    },
    betting: {
        title:         "Betting Service",
        label:         "Player ID (Account):",
        allowRecevoir: true,
        items: [
            { val: '1XBET',  txt: '1xBet',  icon: "https://upload.wikimedia.org/wikipedia/commons/1/14/1xBet_logo.svg", frais: 0.01 },
            { val: 'BET365', txt: 'Bet365', icon: "https://via.placeholder.com/22?text=B365",                           frais: 0.01 },
            { val: 'MELBET', txt: 'Melbet', icon: "https://via.placeholder.com/22?text=MB",                             frais: 0.01 }
        ]
    },
    abonnement: {
        title:         "Subscription Service",
        label:         "Account Email / ID:",
        allowRecevoir: false,   // No withdrawal/receive for subscriptions
        items: [
            { val: 'NETFLIX',  txt: 'Netflix',              icon: "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg",                frais: 0.02 },
            { val: 'STARLINK', txt: 'Starlink',             icon: "https://via.placeholder.com/22?text=SL",                                                   frais: 0.02 },
            { val: 'FACEBOOK', txt: 'Boost Facebook Page',  icon: "https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg",        frais: 0.00 }
        ]
    }
};

// 4. CURRENT_TAUX — conversion rates in Ariary (MGA) per asset unit
//    FIX: added all missing assets that were in ASSETS_DATA but absent here:
//         SKRILL, PAYEER, BET365, MELBET, NETFLIX, STARLINK, FACEBOOK
//    Crypto rates are refreshed automatically by updateTaux().
export let CURRENT_TAUX = {
    // Crypto (updated via Binance API)
    "BTC":  60000000,   // ~60,000 USD × 4,700 MGA/USD
    "TRX":  600,        // ~0.13 USD × 4,700 MGA/USD
    "USDT": 4700,       // always = USD_TO_MGA

    // Wallets (pegged to USD_TO_MGA — no Binance pair)
    "PAYPAL": 4700,
    "SKRILL": 4700,
    "PAYEER": 4700,

    // Betting (1-for-1 — amount is direct Ariary top-up)
    "1XBET":  1,
    "BET365": 1,
    "MELBET": 1,

    // Subscriptions (fixed price per transaction, no unit conversion)
    "NETFLIX":  1,
    "STARLINK": 1,
    "FACEBOOK": 1
};

// 5. updateIcon() — updates the asset logo displayed next to the dropdown
//    FIX: removed the call to window.updateCalc() from here.
//    index.html now calls updateCalc() itself right after updateIcon() returns,
//    which avoids the fragile circular dependency on window.updateCalc.
export function updateIcon() {
    const cryptoSelect = document.getElementById('crypto-select');
    const imgElement   = document.getElementById('asset-img');
    if (!cryptoSelect || !imgElement) return;

    const assetKey = cryptoSelect.value;

    for (const cat in ASSETS_DATA) {
        const found = ASSETS_DATA[cat].items.find(item => item.val === assetKey);
        if (found) {
            imgElement.src = found.icon;
            break;
        }
    }
    // Note: updateCalc() is called by the onchange handler in index.html
}

// 6. updateTaux() — fetches live crypto prices from Binance
//    FIX: no longer auto-executes at module level.
//    Call this from index.html (inside initApp) so the DOM and Supabase
//    are ready before any side effects run.
export async function updateTaux() {
    try {
        const url  = `https://api.binance.com/api/v3/ticker/price?symbols=["BTCUSDT","TRXUSDT"]`;
        const res  = await fetch(url);
        const data = await res.json();

        data.forEach(item => {
            // "BTCUSDT" → strip "USDT" → "BTC", same for "TRXUSDT" → "TRX"
            const uiKey = item.symbol.replace('USDT', '');
            if (Object.prototype.hasOwnProperty.call(CURRENT_TAUX, uiKey)) {
                CURRENT_TAUX[uiKey] = Math.round(parseFloat(item.price) * USD_TO_MGA);
            }
        });

        CURRENT_TAUX["USDT"] = USD_TO_MGA;
        console.log('[TakaloCash] Rates updated:', new Date().toLocaleTimeString());
    } catch (err) {
        console.warn('[TakaloCash] Binance API unavailable — using cached rates.');
    }
}
