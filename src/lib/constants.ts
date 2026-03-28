import { Facility, AppSettings, Reward } from '../types';

export const MOCK_FACILITIES: Facility[] = [
  {
    id: "F001",
    name: "Green E-Waste Center",
    address: "123 Eco St",
    city: "Chennai",
    phone: "+91 98765 43210",
    distance: "2.5 km",
    lat: 13.0827,
    lng: 80.2707,
    acceptedItems: ["Mobile", "Laptop", "Battery"],
    hours: "9 AM - 6 PM"
  },
  {
    id: "F002",
    name: "Tech Recycle Hub",
    address: "45 Digital Way",
    city: "Bangalore",
    phone: "+91 98765 43211",
    distance: "4.2 km",
    lat: 12.9716,
    lng: 77.5946,
    acceptedItems: ["Monitor", "CPU", "Printer"],
    hours: "10 AM - 7 PM"
  },
  {
    id: "F003",
    name: "Safe Disposal Solutions",
    address: "78 Industrial Area",
    city: "Mumbai",
    phone: "+91 98765 43212",
    distance: "1.8 km",
    lat: 19.0760,
    lng: 72.8777,
    acceptedItems: ["TV", "Refrigerator", "Washing Machine"],
    hours: "8 AM - 5 PM"
  },
  {
    id: "F004",
    name: "Urban E-Recyclers",
    address: "12 Metro Plaza",
    city: "Delhi",
    phone: "+91 98765 43213",
    distance: "5.0 km",
    lat: 28.6139,
    lng: 77.2090,
    acceptedItems: ["Keyboard", "Mouse", "Cables"],
    hours: "9 AM - 8 PM"
  }
];

export const STATIC_REWARDS: Reward[] = [
  {
    id: "R001",
    name: "Amazon Gift Card",
    cost: 100,
    type: "coupon",
    description: "Get a $10 Amazon Gift Card for your recycling efforts."
  },
  {
    id: "R002",
    name: "Eco-Friendly Water Bottle",
    cost: 200,
    type: "product",
    description: "A sustainable bamboo water bottle."
  },
  {
    id: "R003",
    name: "Organic Grocery Voucher",
    cost: 300,
    type: "voucher",
    description: "A $30 voucher for your local organic store."
  }
];

export const DEFAULT_SETTINGS: AppSettings = {
  pointsPerKg: 10,
  rewardsEnabled: true
};

export const STORAGE_KEYS = {
  USERS: 'ecocycle_users',
  CURRENT_USER: 'ecocycle_current_user',
  DISPOSALS: 'ecocycle_disposals',
  FACILITIES: 'ecocycle_facilities',
  SETTINGS: 'ecocycle_settings',
  REWARDS: 'ecocycle_rewards'
};
