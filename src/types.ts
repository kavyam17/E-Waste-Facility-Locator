/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Role = 'user' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  password?: string;
  location?: string;
  credits: number;
  totalDisposed: number;
  rank: number;
  role: Role;
  rewards: Reward[];
}

export interface Facility {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  distance: string;
  lat: number;
  lng: number;
  acceptedItems: string[];
  hours: string;
}

export interface DisposalRecord {
  id: string;
  userId: string;
  facilityId: string;
  itemName: string;
  category: string;
  weight: number;
  creditsEarned: number;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  proofUrl: string;
}

export interface Reward {
  id: string;
  name: string;
  cost: number;
  type: 'coupon' | 'product' | 'voucher';
  description: string;
}

export interface AppSettings {
  pointsPerKg: number;
  rewardsEnabled: boolean;
}
