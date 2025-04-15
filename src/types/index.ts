export interface Location {
  lat: number;
  lng: number;
  address: string;
}

export type VehicleType = 'standard' | 'premium' | 'xl';
export type PaymentMethod = 'cash' | 'card' | 'wallet' | 'split';

export interface PaymentDetails {
  method: PaymentMethod;
  amount: number;
  splitWith?: Array<{
    email: string;
    amount: number;
    status: 'pending' | 'paid' | 'declined';
  }>;
  surgeMultiplier?: number;
  couponCode?: string;
  couponDiscount?: number;
  transactionId?: string;
}