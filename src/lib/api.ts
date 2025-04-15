import { http } from './http';
import { PaymentDetails } from '@/types';

// Types
export interface GeneralSettings {
  siteName: string;
  currency: string;
  basePrice: number;
  supportEmail: string;
}

export interface Zone {
  id: string;
  name: string;
  coordinates: Array<{ lat: number; lng: number }>;
  isActive: boolean;
}

export interface RidePayload {
  pickup: {
    lat: number;
    lng: number;
    address: string;
  };
  destination: {
    lat: number;
    lng: number;
    address: string;
  };
  vehicleType: 'standard' | 'premium' | 'xl';
  scheduledTime?: string;
  paymentMethod: 'cash' | 'card' | 'wallet' | 'split';
  couponCode?: string;
  splitWith?: Array<{
    email: string;
    amount: number;
  }>;
}

export interface FareResponse {
  fare: number;
  distance: number;
  duration: number;
  currency: string;
  surgeMultiplier?: number;
}

export interface RideDetails {
  id: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  pickup: {
    lat: number;
    lng: number;
    address: string;
  };
  destination: {
    lat: number;
    lng: number;
    address: string;
  };
  driver?: {
    id: string;
    name: string;
    phone: string;
    photo?: string;
    rating: number;
    vehicle: {
      model: string;
      plateNumber: string;
      type: string;
    };
  };
  fare: number;
  distance: number;
  duration: number;
  createdAt: string;
  scheduledTime?: string;
}

// App settings
export const getGeneralSetting = () => 
  http.get<GeneralSettings>('/general-setting');

export const getCountries = () => 
  http.get<Array<{ code: string; name: string }>>('/get-countries');

export const getLanguage = (key: string) => 
  http.get<Record<string, string>>(`/language/${key}`);

export const getPolicies = () => 
  http.get<Array<{ title: string; content: string }>>('/policies');

export const getFaq = () => 
  http.get<Array<{ question: string; answer: string }>>('/faq');

export const getZones = () => 
  http.get<Zone[]>('/zones');

// Ride endpoints
export const findFareAndDistance = (payload: RidePayload) =>
  http.post<FareResponse>('/ride/fare-and-distance', payload);

export const createRide = (payload: RidePayload) =>
  http.post<{ rideId: string }>('/ride/create', payload);

export const getBids = (rideId: string) =>
  http.get<Array<{
    id: string;
    driverId: string;
    price: number;
    estimatedTime: number;
    driver: {
      name: string;
      rating: number;
      photo?: string;
      vehicle: {
        model: string;
        plateNumber: string;
      };
    };
  }>>(`/ride/bids/${rideId}`);

export const rejectBid = (bidId: string) =>
  http.post(`/ride/reject/${bidId}`);

export const acceptBid = (bidId: string) =>
  http.post(`/ride/accept/${bidId}`);

export const listRides = () =>
  http.get<RideDetails[]>('/ride/list');

export const cancelRide = (rideId: string) =>
  http.post(`/ride/cancel/${rideId}`);

export const sosRide = (rideId: string) =>
  http.post(`/ride/sos/${rideId}`);

export const getRideDetails = (rideId: string) =>
  http.get<RideDetails>(`/ride/details/${rideId}`);

export const getRidePayment = (rideId: string) =>
  http.get<{
    id: string;
    amount: number;
    currency: string;
    status: 'pending' | 'completed' | 'failed';
    method: string;
    transactionId?: string;
  }>(`/ride/payment/${rideId}`);

export const saveRidePayment = (rideId: string, data: {
  paymentMethod: string;
  transactionId?: string;
  amount: number;
}) =>
  http.post(`/ride/payment/${rideId}`, data);

// Reviews
export interface Review {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  user: {
    name: string;
    photo?: string;
  };
}

export const getReviews = () => 
  http.get<Review[]>('/reviews');

export const postReview = (rideId: string, data: {
  rating: number;
  comment?: string;
}) =>
  http.post<Review>(`/reviews/${rideId}`, data);

// Coupons
export interface Coupon {
  id: string;
  code: string;
  discount: number;
  discountType: 'percentage' | 'fixed';
  expiresAt: string;
  isValid: boolean;
}

export const getCoupons = () => 
  http.get<Coupon[]>('/coupons');

export const applyCoupon = (code: string) =>
  http.post<{
    valid: boolean;
    discount?: number;
    message: string;
  }>('/apply-coupon', { code });

// Messages
export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'driver' | 'system';
  createdAt: string;
}

export const getRideMessages = (rideId: string) =>
  http.get<Message[]>(`/ride/${rideId}/messages`);

export const sendMessage = (rideId: string, content: string) =>
  http.post<Message>(`/ride/${rideId}/messages`, { content });

// Wallet endpoints
export interface WalletDetails {
  balance: number;
  currency: string;
  transactions: Array<{
    id: string;
    amount: number;
    type: 'credit' | 'debit';
    description: string;
    timestamp: string;
  }>;
}

export const getWalletBalance = () =>
  http.get<WalletDetails>('/wallet/balance');

export const topUpWallet = (amount: number) =>
  http.post<{
    paymentUrl: string;
    transactionId: string;
  }>('/wallet/topup', { amount });

export const processWalletPayment = (rideId: string, paymentDetails: PaymentDetails) =>
  http.post<{
    success: boolean;
    receipt?: DigitalReceipt;
    message?: string;
  }>(`/ride/${rideId}/wallet-payment`, paymentDetails);

// Payment endpoints
export interface DigitalReceipt {
  id: string;
  rideId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  splitPayments?: Array<{
    email: string;
    amount: number;
    status: string;
  }>;
  couponCode?: string;
  couponDiscount?: number;
  surgeMultiplier?: number;
  timestamp: string;
  status: 'paid' | 'pending' | 'failed';
  rewardsEarned?: number;
}

export const initiateCardPayment = (rideId: string, paymentDetails: PaymentDetails) =>
  http.post<{
    paymentUrl: string;
    transactionId: string;
  }>(`/ride/${rideId}/initiate-payment`, paymentDetails);

export const checkPaymentStatus = (rideId: string, transactionId: string) =>
  http.get<{
    status: 'success' | 'pending' | 'failed';
    receipt?: DigitalReceipt;
  }>(`/ride/${rideId}/payment-status/${transactionId}`);

export const getDigitalReceipt = (rideId: string) =>
  http.get<DigitalReceipt>(`/ride/${rideId}/receipt`);

export const sendSplitPaymentInvites = (rideId: string, splitWith: Array<{ email: string; amount: number }>) =>
  http.post<{
    sentTo: string[];
    paymentLinks: Record<string, string>;
  }>(`/ride/${rideId}/split-payment`, { splitWith });

// Payment Methods & Preferences
export interface SavedPaymentMethod {
  id: string;
  type: 'card' | 'wallet';
  isDefault: boolean;
  lastUsed: string;
  details: {
    cardType?: string;
    last4?: string;
    expiryDate?: string;
    walletId?: string;
  };
}

export interface PaymentPreferences {
  defaultMethod: string;
  recurringTopUp?: {
    enabled: boolean;
    amount: number;
    frequency: 'weekly' | 'monthly';
    minBalance: number;
    nextDate?: string;
  };
  savedMethods: SavedPaymentMethod[];
  rewardPoints: number;
  familyProfiles: FamilyProfile[];
}

export interface FamilyProfile {
  id: string;
  name: string;
  email: string;
  relationship: string;
  paymentMethods: string[];
  monthlyLimit?: number;
  isActive: boolean;
}

export const getUserPaymentPreferences = () =>
  http.get<PaymentPreferences>('/user/payment-preferences');

export const updatePaymentPreferences = (preferences: Partial<PaymentPreferences>) =>
  http.put('/user/payment-preferences', preferences);

export const addSavedPaymentMethod = (method: Omit<SavedPaymentMethod, 'id'>) =>
  http.post<SavedPaymentMethod>('/user/payment-methods', method);

export const removeSavedPaymentMethod = (methodId: string) =>
  http.delete(`/user/payment-methods/${methodId}`);

export const setDefaultPaymentMethod = (methodId: string) =>
  http.put(`/user/payment-methods/${methodId}/default`);

export const addFamilyProfile = (profile: Omit<FamilyProfile, 'id'>) =>
  http.post<FamilyProfile>('/user/family-profiles', profile);

export const updateFamilyProfile = (profileId: string, updates: Partial<FamilyProfile>) =>
  http.put(`/user/family-profiles/${profileId}`, updates);

export const removeFamilyProfile = (profileId: string) =>
  http.delete(`/user/family-profiles/${profileId}`);

// Rewards System
export interface RewardTransaction {
  id: string;
  points: number;
  type: 'earned' | 'redeemed';
  description: string;
  timestamp: string;
}

export interface RewardPoints {
  balance: number;
  transactions: Array<{
    id: string;
    points: number;
    type: 'earned' | 'redeemed';
    description: string;
    timestamp: string;
  }>;
  nextTier?: {
    name: string;
    pointsNeeded: number;
  };
}

export const getRewardPoints = () =>
  http.get<{
    balance: number;
    transactions: RewardTransaction[];
    nextTier?: {
      name: string;
      pointsNeeded: number;
    };
  }>('/user/rewards');

export const redeemRewardPoints = (points: number, purpose: string) =>
  http.post<{
    success: boolean;
    newBalance: number;
    discount?: number;
  }>('/user/rewards/redeem', { points, purpose });