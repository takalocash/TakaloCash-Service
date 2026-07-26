// ============================================================
// TAKALOCASH — P2P TYPE DEFINITIONS
// ============================================================

export type OfferType   = 'BUY' | 'SELL';
export type OfferStatus = 'ACTIVE' | 'PAUSED' | 'CLOSED';
export type TradeStatus = 'PENDING' | 'PAID' | 'COMPLETED' | 'CANCELLED' | 'DISPUTE';
export type PaymentMethod = 'Mvola' | 'Orange Money' | 'Airtel Money' | 'Bank Transfer';

export interface Profile {
  id:             string;
  display_name:   string;
  avatar_url:     string | null;
  phone:          string | null;
  tk_id:          string;
  trades_count:   number;
  trades_success: number;
  reputation:     number;  // 0–100
  is_verified:    boolean;
  created_at:     string;
}

export interface Balance {
  id:             string;
  user_id:        string;
  currency:       string;
  available:      number;
  locked_balance: number;
  updated_at:     string;
}

export interface P2POffer {
  id:              string;
  user_id:         string;
  type:            OfferType;
  from_currency:   string;
  to_currency:     string;
  rate:            number;
  min_amount:      number;
  max_amount:      number;
  payment_methods: PaymentMethod[];
  payment_details: string | null;
  status:          OfferStatus;
  created_at:      string;
  updated_at:      string;
  // Joined
  profile?:        Profile;
}

export interface P2PTrade {
  id:                      string;
  offer_id:                string;
  buyer_id:                string;
  seller_id:               string;
  amount_crypto:           number;
  amount_fiat:             number;
  selected_payment_method: string;
  status:                  TradeStatus;
  dispute_reason:          string | null;
  created_at:              string;
  updated_at:              string;
  expires_at:              string;
  completed_at:            string | null;
  // Joined
  offer?:                  P2POffer;
  buyer_profile?:          Profile;
  seller_profile?:         Profile;
}

export interface ChatMessage {
  id:             string;
  trade_id:       string;
  sender_id:      string | null;
  message:        string;
  attachment_url: string | null;
  is_system:      boolean;
  created_at:     string;
  // Joined
  sender?:        Profile;
}

export interface InternalTransfer {
  id:           string;
  sender_id:    string;
  recipient_id: string;
  currency:     string;
  amount:       number;
  note:         string | null;
  reference:    string;
  created_at:   string;
}

export interface OfferFilters {
  type:           OfferType;
  currency:       string;
  paymentMethod:  string;
  amount:         number | null;
}

export interface CreateOfferForm {
  type:            OfferType;
  from_currency:   string;
  rate:            number;
  min_amount:      number;
  max_amount:      number;
  payment_methods: PaymentMethod[];
  payment_details: string;
}

export interface LookupResult {
  found:        boolean;
  id?:          string;
  display_name?:string;
  tk_id?:       string;
  avatar_url?:  string | null;
  is_verified?: boolean;
  reputation?:  number;
  trades_count?:number;
}
