/**
 * TakaloCash — Serverless Function Vercel
 * Route  : GET /api/get-address?coin=USDT&network=TRC20
 *
 * Flux   :
 *  1. Valide coin + network
 *  2. Cherche dans le cache Supabase (table crypto_addresses)
 *  3. Si trouvé → renvoie directement (0 appel Binance)
 *  4. Si absent → appelle Binance /sapi/v1/capital/deposit/address
 *  5. Stocke le résultat dans Supabase (upsert)
 *  6. Renvoie { success, coin, network, address, tag }
 *
 * Variables d'environnement requises (Vercel Dashboard + .env.local) :
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   BINANCE_API_KEY
 *   BINANCE_SECRET_KEY
 */

'use strict';

const crypto   = require('crypto');
const { createClient } = require('@supabase/supabase-js');

// ── Constantes ────────────────────────────────────────────────────────────────

/**
 * Coins nécessitant un MEMO / TAG en plus de l'adresse.
 * La clé est le coin Binance (majuscules), la valeur est le champ retourné.
 */
const MEMO_COINS = new Set(['XRP', 'XLM', 'EOS', 'ATOM', 'BAND', 'TON', 'HBAR', 'ALGO']);

/**
 * Mapping réseau frontend → réseau Binance (coin parameter)
 * Binance attend les noms de réseau dans un format précis.
 */
const NETWORK_MAP = {
    // Format court → format Binance
    'TRC20'   : 'TRX',
    'BEP20'   : 'BSC',
    'BEP2'    : 'BNB',
    'ERC20'   : 'ETH',
    'BTC'     : 'BTC',
    'BITCOIN' : 'BTC',
    'BSC'     : 'BSC',
    'TRX'     : 'TRX',
    'ETH'     : 'ETH',
    'SOL'     : 'SOL',
    'AVAXC'   : 'AVAXC',
    'MATIC'   : 'MATIC',
    'ARBITRUM': 'ARBITRUM',
    'OP'      : 'OPTIMISM',
    'XRP'     : 'XRP',
    'XLM'     : 'XLM',
    'ATOM'    : 'ATOM',
    'TON'     : 'TON',
};

/** Coins autorisés sur TakaloCash (whitelist de sécurité) */
const ALLOWED_COINS = new Set([
    'BTC', 'ETH', 'USDT', 'USDC', 'BNB', 'TRX',
    'XRP', 'SOL', 'MATIC', 'AVAX', 'ATOM', 'TON',
    'XLM', 'EOS',
]);

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Génère la signature HMAC-SHA256 pour l'API Binance.
 */
function binanceSign(queryString, secret) {
    return crypto
        .createHmac('sha256', secret)
        .update(queryString)
        .digest('hex');
}

/**
 * Requête GET signée vers l'API Binance.
 * @param {string} path    - ex: '/sapi/v1/capital/deposit/address'
 * @param {Object} params  - paramètres (sans signature ni timestamp)
 * @returns {Promise<any>}
 */
async function binanceFetch(path, params) {
    const apiKey   = process.env.BINANCE_API_KEY;
    const secret   = process.env.BINANCE_SECRET_KEY;

    if (!apiKey || !secret) {
        throw new Error('Variables BINANCE_API_KEY / BINANCE_SECRET_KEY manquantes.');
    }

    const timestamp   = Date.now();
    const qs          = new URLSearchParams({ ...params, timestamp: String(timestamp) }).toString();
    const signature   = binanceSign(qs, secret);
    const url         = `https://api.binance.com${path}?${qs}&signature=${signature}`;

    const res = await fetch(url, {
        method : 'GET',
        headers: {
            'X-MBX-APIKEY': apiKey,
            'Content-Type' : 'application/json',
        },
    });

    const body = await res.json();

    if (!res.ok) {
        const msg = body?.msg || body?.message || `Erreur HTTP Binance ${res.status}`;
        throw new Error(msg);
    }

    return body;
}

/**
 * Client Supabase admin (service_role) — singleton par instance froide.
 */
let _sbAdmin = null;
function getSupabase() {
    if (!_sbAdmin) {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!url || !key) throw new Error('Variables Supabase manquantes.');
        _sbAdmin = createClient(url, key, {
            auth: { autoRefreshToken: false, persistSession: false },
        });
    }
    return _sbAdmin;
}

/**
 * Normalise le réseau reçu du frontend vers le format Binance.
 * @param {string} network
 * @returns {string}
 */
function normalizeNetwork(network) {
    if (!network) return null;
    const upper = network.toUpperCase().trim();
    return NETWORK_MAP[upper] || upper;
}

// ── Handler principal ─────────────────────────────────────────────────────────

module.exports = async function handler(req, res) {

    // ── CORS ──────────────────────────────────────────────────────────────────
    const origin  = req.headers.origin || '';
    const allowed = [
        'https://takalocash.com',
        'https://www.takalocash.com',
        'http://localhost:3000',
    ];
    if (allowed.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Vary', 'Origin');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, error: 'Méthode non autorisée.' });
    }

    // ── 1. Validation des paramètres ──────────────────────────────────────────
    const coin    = (req.query.coin    || '').toUpperCase().trim();
    const network = (req.query.network || '').trim();

    if (!coin) {
        return res.status(400).json({
            success: false,
            error  : 'Paramètre "coin" obligatoire (ex: USDT, BTC, TRX).',
        });
    }

    if (!ALLOWED_COINS.has(coin)) {
        return res.status(400).json({
            success: false,
            error  : `Coin "${coin}" non supporté par TakaloCash.`,
        });
    }

    // Réseau Binance normalisé
    const binanceNetwork = normalizeNetwork(network);

    // ── 2. Recherche dans le cache Supabase ───────────────────────────────────
    const sb = getSupabase();

    try {
        let query = sb
            .from('crypto_addresses')
            .select('coin, network, address, memo_tag')
            .eq('coin', coin)
            .eq('is_active', true);

        // Si un réseau est spécifié, filtre dessus ; sinon prend la première entrée active
        if (binanceNetwork) {
            query = query.eq('network', binanceNetwork);
        } else {
            query = query.limit(1);
        }

        const { data: cached, error: cacheErr } = await query.maybeSingle();

        if (cacheErr) {
            console.error('[get-address] Erreur lecture cache:', cacheErr.message);
            // On continue vers Binance si le cache est indisponible
        }

        if (cached) {
            // Cache hit ✓
            console.log(`[get-address] Cache hit: ${coin}/${cached.network}`);
            return res.status(200).json({
                success : true,
                cached  : true,
                coin    : cached.coin,
                network : cached.network,
                address : cached.address,
                tag     : cached.memo_tag || null,
            });
        }
    } catch (cacheEx) {
        console.error('[get-address] Exception cache:', cacheEx.message);
        // Continue vers Binance
    }

    // ── 3. Appel API Binance ──────────────────────────────────────────────────
    const binanceParams = { coin };
    if (binanceNetwork) binanceParams.network = binanceNetwork;

    let binanceData;
    try {
        binanceData = await binanceFetch('/sapi/v1/capital/deposit/address', binanceParams);
    } catch (binErr) {
        console.error('[get-address] Erreur Binance:', binErr.message);
        return res.status(502).json({
            success: false,
            error  : `Impossible de récupérer l'adresse depuis Binance : ${binErr.message}`,
        });
    }

    // Validation de la réponse Binance
    if (!binanceData?.address) {
        return res.status(404).json({
            success: false,
            error  : `Binance n'a retourné aucune adresse pour ${coin}${binanceNetwork ? '/' + binanceNetwork : ''}.`,
        });
    }

    const returnedAddress = binanceData.address;
    const returnedNetwork = binanceData.network || binanceNetwork || coin;
    const returnedTag     = binanceData.tag || binanceData.memo || null;

    // ── 4. Stockage dans Supabase (upsert) ───────────────────────────────────
    try {
        const { error: upsertErr } = await sb
            .from('crypto_addresses')
            .upsert(
                [{
                    coin      : coin,
                    network   : returnedNetwork,
                    address   : returnedAddress,
                    memo_tag  : returnedTag,
                    source    : 'binance',
                    is_active : true,
                    updated_at: new Date().toISOString(),
                }],
                { onConflict: 'coin,network' }
            );

        if (upsertErr) {
            console.error('[get-address] Erreur upsert Supabase:', upsertErr.message);
            // Non bloquant : on renvoie quand même la réponse
        } else {
            console.log(`[get-address] Supabase upsert OK: ${coin}/${returnedNetwork}`);
        }
    } catch (upsertEx) {
        console.error('[get-address] Exception upsert:', upsertEx.message);
        // Non bloquant
    }

    // ── 5. Réponse au Frontend ────────────────────────────────────────────────
    return res.status(200).json({
        success : true,
        cached  : false,
        coin,
        network : returnedNetwork,
        address : returnedAddress,
        tag     : returnedTag,
    });
};
