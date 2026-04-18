// config.js
// Fichier de configuration central pour TakaloCash Premium.

export let USD_TO_MGA = 4700; 

// 1. ADRESSE DE RÉCEPTION (Ny adiresinao handraisana vola)
export const ADDR_RECEPT = {
    'TRX': 'VOTRE_ADRESSE_TRON_ICI',
    'USDT': 'VOTRE_ADRESSE_USDT_TRC20_ICI',
    'BTC': 'VOTRE_ADRESSE_BITCOIN_ICI',
    'PAYPAL': 'votre-email@paypal.com',
    '1XBET': 'VOTRE_ID_1XBET'
};

// 2. ASSETS_DATA (Lisitra feno miaraka amin'ny Labels sy Icons)
export const ASSETS_DATA = {
    crypto: {
        title: "Crypto Transaction",
        label: "Destination address:",
        allowRecevoir: true,
        items: [
            { val: 'BTC',  txt: 'Bitcoin (BTC)', icon: "https://cryptologos.cc/logos/bitcoin-btc-logo.svg", frais: 0.04 },
            { val: 'TRX',  txt: 'TRX (TRC20)', icon: "https://cryptologos.cc/logos/tron-trx-logo.svg", frais: 0.02 },
            { val: 'USDT', txt: 'USDT (TRC20)', icon: "https://cryptologos.cc/logos/tether-usdt-logo.svg", frais: 0.03 }
        ]
    },
    wallet: {
        title: "Wallet Transfer",
        label: "Email or Wallet ID:",
        allowRecevoir: true,
        items: [
            { val: 'PAYPAL', txt: 'PayPal', icon: "https://www.vectorlogo.zone/logos/paypal/paypal-icon.svg", frais: 0.05 },
            { val: 'SKRILL', txt: 'Skrill', icon: "https://www.vectorlogo.zone/logos/skrill/skrill-icon.svg", frais: 0.05 }
        ]
    },
    betting: {
        title: "Betting Service",
        label: "Player ID (Account):",
        allowRecevoir: true,
        items: [
            { val: '1XBET', txt: '1xBet', icon: "https://upload.wikimedia.org/wikipedia/commons/1/14/1xBet_logo.svg", frais: 0.01 }
        ]
    },
    abonnement: {
        title: "Subscription Service",
        label: "Account Email/ID:",
        allowRecevoir: false, // Tsy misy retrait eto
        items: [
            { val: 'NETFLIX',  txt: 'Netflix', icon: "https://www.cdnlogo.com/logos/n/82/netflix-n.svg", frais: 0.02 },
            { val: 'STARLINK', txt: 'Starlink', icon: "https://www.vectorlogo.zone/logos/starlink/starlink-icon.svg", frais: 0.02 }
        ]
    }
};

// 3. CURRENT_TAUX (Sanda fototra)
export let CURRENT_TAUX = {
    "BTC": 300000000,
    "TRX": 600,
    "USDT": 4700,
    "1XBET": 1,
    "PAYPAL": 4500
};

// 4. UPDATE ICON (Nafindra teto)
export function updateIcon() {
    const cryptoSelect = document.getElementById('crypto-select');
    const imgElement = document.getElementById('asset-img');
    
    if (!cryptoSelect || !imgElement) return;

    const assetKey = cryptoSelect.value;
    let iconUrl = "";

    // Mikaroka ny icon ao anaty ASSETS_DATA
    for (const cat in ASSETS_DATA) {
        const found = ASSETS_DATA[cat].items.find(item => item.val === assetKey);
        if (found) {
            iconUrl = found.icon;
            break; 
        }
    }

    if (iconUrl) imgElement.src = iconUrl;

    // Antsoina ny updateCalc ao amin'ny window (index.html)
    if (typeof window.updateCalc === "function") {
        window.updateCalc();
    }
}

// 5. UPDATE TAUX (API Binance - Isaky ny adiny iray)
export async function updateTaux() {
    try {
        const symbols = ["BTCUSDT", "TRXUSDT"];
        const url = `https://api.binance.com/api/v3/ticker/price?symbols=["BTCUSDT","TRXUSDT"]`;
        
        const res = await fetch(url);
        const data = await res.json();

        data.forEach(item => {
            const uiKey = item.symbol.replace('USDT', '');
            if (CURRENT_TAUX.hasOwnProperty(uiKey)) {
                CURRENT_TAUX[uiKey] = Math.round(parseFloat(item.price) * USD_TO_MGA);
            }
        });

        CURRENT_TAUX["USDT"] = USD_TO_MGA;
        console.log('[TakaloCash] Taux actualisés :', new Date().toLocaleTimeString());
    } catch (err) {
        console.warn('[TakaloCash] Erreur API Binance.');
    }
}

// Fandefasana ny update voalohany
updateTaux();

// Averina isaky ny adiny iray (3600000 ms)
setInterval(updateTaux, 3600000);
