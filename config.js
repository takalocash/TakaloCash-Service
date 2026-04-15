// config.js
// Fichier de configuration central pour TakaloCash Premium.
// Modifiez uniquement ce fichier pour mettre à jour les actifs, taux et frais.

// ============================================================
// TAUX DE CHANGE USD → Ariary (MGA)
// Mettez à jour cette valeur manuellement ou via une fonction
// d'actualisation automatique (API CoinGecko, Binance, etc.)
// ============================================================
export let USD_TO_MGA = 4700;

// ============================================================
// ASSETS_DATA — Données des actifs par catégorie
//
// Chaque actif contient :
//   val   : Identifiant interne utilisé par l'application UI
//           (doit correspondre aux clés de CURRENT_TAUX)
//   txt   : Texte affiché dans le menu déroulant
//   icon  : URL de l'icône SVG (CDN fiable uniquement)
//   frais : Frais de service en pourcentage décimal (ex: 0.03 = 3%)
//
// FIX #1 — Les val 'BTCUSDT' et 'TRXUSDT' ont été corrigés en
//   'BTC' et 'TRX' pour correspondre aux clés utilisées dans
//   l'application (updateIcon, updateCalc, CURRENT_TAUX).
//   Le symbole API Binance est séparé dans BINANCE_SYMBOLS.
//
// FIX #2 — Catégorie 'abonnement' ajoutée (était absente).
// ============================================================
export const ASSETS_DATA = {

    crypto: [
        {
            val: 'BTC',   // FIX #1 : était 'BTCUSDT'
            txt: 'Bitcoin (BTC)',
            icon: 'https://cryptologos.cc/logos/bitcoin-btc-logo.svg',
            frais: 0.04   // 4% de frais de service
        },
        {
            val: 'TRX',   // FIX #1 : était 'TRXUSDT'
            txt: 'TRX (TRC20)',
            icon: 'https://cryptologos.cc/logos/tron-trx-logo.svg',
            frais: 0.02   // 2% de frais de service
        },
        {
            val: 'USDT',
            txt: 'USDT (TRC20)',
            icon: 'https://cryptologos.cc/logos/tether-usdt-logo.svg',
            frais: 0.03   // 3% de frais de service
        }
    ],

    wallet: [
        {
            val: 'PAYPAL',
            txt: 'PayPal',
            // FIX #5 : URL vectorlogo.zone remplacée par une source fiable
            icon: 'https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg',
            frais: 0.05   // 5% de frais de service
        },
        {
            val: 'SKRILL',
            txt: 'Skrill',
            // FIX #5 : URL vectorlogo.zone remplacée
            icon: 'https://upload.wikimedia.org/wikipedia/commons/8/8b/Skrill_logo.svg',
            frais: 0.05   // 5% de frais de service
        },
        {
            val: 'PAYEER',
            txt: 'Payeer',
            icon: 'https://via.placeholder.com/22?text=PE',  // Remplacez par l'icône officielle
            frais: 0.04   // 4% de frais de service
        }
    ],

    betting: [
        {
            val: '1XBET',
            txt: '1xBet',
            icon: 'https://upload.wikimedia.org/wikipedia/commons/1/14/1xBet_logo.svg',
            frais: 0.01   // 1% de frais de service
        },
        {
            // FIX #2 : BET365 et MELBET ajoutés (manquants)
            val: 'BET365',
            txt: 'Bet365',
            icon: 'https://via.placeholder.com/22?text=B365', // Remplacez par l'icône officielle
            frais: 0.01
        },
        {
            val: 'MELBET',
            txt: 'Melbet',
            icon: 'https://via.placeholder.com/22?text=MB',   // Remplacez par l'icône officielle
            frais: 0.01
        }
    ],

    // FIX #2 — Catégorie 'abonnement' entièrement ajoutée
    abonnement: [
        {
            val: 'NETFLIX',
            txt: 'Netflix',
            icon: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg',
            frais: 0.00   // Pas de frais additionnels
        },
        {
            val: 'STARLINK',
            txt: 'Starlink',
            icon: 'https://via.placeholder.com/22?text=SL',  // Remplacez par l'icône officielle
            frais: 0.00
        },
        {
            val: 'FACEBOOK',
            txt: 'Boost Page Facebook',
            icon: 'https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg',
            frais: 0.00
        }
    ]
};

// ============================================================
// BINANCE_SYMBOLS — Correspondance val UI → symbole API Binance
//
// FIX #1 — Les symboles API (BTCUSDT, TRXUSDT) sont maintenant
// séparés des identifiants UI ('BTC', 'TRX') pour éviter toute
// confusion. Utilisez ce mapping dans votre appel fetch Binance.
//
// Exemple :
//   const symbol = BINANCE_SYMBOLS['BTC']; // → 'BTCUSDT'
//   fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`)
// ============================================================
export const BINANCE_SYMBOLS = {
    'BTC':  'BTCUSDT',
    'TRX':  'TRXUSDT',
    'USDT': null        // USDT ≈ 1 USD, pas besoin d'appel API
};

// ============================================================
// CURRENT_TAUX — Taux de conversion en Ariary (MGA) par actif
//
// FIX #1 — Clés renommées 'BTC' et 'TRX' (cohérence avec ASSETS_DATA)
// FIX #3 — Actifs manquants ajoutés : SKRILL, PAYEER, BET365,
//           MELBET, NETFLIX, STARLINK, FACEBOOK
// FIX #4 — PAYPAL aligné sur USD_TO_MGA (4700). Si vous souhaitez
//           un taux différent (ex: 4500 pour marge), documentez-le
//           explicitement ici avec un commentaire.
//
// Ces valeurs sont les valeurs par défaut au démarrage.
// Elles doivent être mises à jour dynamiquement via une fonction
// d'actualisation (voir updateTaux() ci-dessous).
// ============================================================
export let CURRENT_TAUX = {

    // Crypto (mis à jour via API Binance)
    'BTC':  60000000,   // FIX #1 : était 'BTCUSDT' — ~60 000 USD × 4700 MGA/USD
    'TRX':  600,        // FIX #1 : était 'TRXUSDT' — ~0.13 USD × 4700 MGA/USD
    'USDT': 4700,       // Aligné sur USD_TO_MGA

    // Wallets (calculés sur USD_TO_MGA)
    'PAYPAL': 4700,     // FIX #4 : corrigé (était 4500 sans justification)
    'SKRILL': 4700,     // FIX #3 : ajouté
    'PAYEER': 4700,     // FIX #3 : ajouté

    // Betting (1 pour 1 — pas de conversion, montant direct en Ar)
    '1XBET':  1,
    'BET365': 1,        // FIX #3 : ajouté
    'MELBET': 1,        // FIX #3 : ajouté

    // Abonnements (1 pour 1 — prix fixe en Ar défini par transaction)
    'NETFLIX':  1,      // FIX #3 : ajouté
    'STARLINK': 1,      // FIX #3 : ajouté
    'FACEBOOK': 1       // FIX #3 : ajouté
};

// ============================================================
// updateTaux() — Actualisation automatique des cours crypto
//
// Appelez cette fonction au démarrage de l'app et à intervalle
// régulier (ex: toutes les 60 secondes) pour garder les taux
// à jour sans rechargement de page.
//
// Utilisation :
//   import { updateTaux } from './config.js';
//   await updateTaux();
//   setInterval(updateTaux, 60000);
// ============================================================
export async function updateTaux() {
    try {
        const symbols = Object.values(BINANCE_SYMBOLS).filter(Boolean);
        const query   = symbols.map(s => `"${s}"`).join(',');
        const url     = `https://api.binance.com/api/v3/ticker/price?symbols=[${query}]`;
        const res     = await fetch(url);
        const data    = await res.json();

        data.forEach(item => {
            // Retrouver la clé UI correspondante au symbole Binance
            const uiKey = Object.keys(BINANCE_SYMBOLS)
                .find(k => BINANCE_SYMBOLS[k] === item.symbol);
            if (uiKey) {
                CURRENT_TAUX[uiKey] = Math.round(parseFloat(item.price) * USD_TO_MGA);
            }
        });

        console.log('[TakaloCash] Taux actualisés :', new Date().toLocaleTimeString('fr-FR'));
    } catch (err) {
        console.warn('[TakaloCash] Échec mise à jour des taux :', err.message);
        // Les valeurs par défaut de CURRENT_TAUX restent actives
    }
}
