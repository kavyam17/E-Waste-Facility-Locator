import { User, Facility, Reward, DisposalRecord } from '../types';

const API_BASE = '/api';

export const api = {
  // Auth
  login: async (email: string, password: string): Promise<User> => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error('Invalid credentials');
    return res.json();
  },

  register: async (name: string, email: string, password: string): Promise<User> => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    if (!res.ok) throw new Error('Registration failed');
    return res.json();
  },

  // Facilities
  getFacilities: async (): Promise<Facility[]> => {
    const res = await fetch(`${API_BASE}/facilities`);
    return res.json();
  },

  // Rewards
  getRewards: async (): Promise<Reward[]> => {
    const res = await fetch(`${API_BASE}/rewards`);
    return res.json();
  },

  redeemReward: async (userId: string, rewardId: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/rewards/redeem`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, rewardId }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Redemption failed');
    }
  },

  addReward: async (reward: Omit<Reward, 'id'>): Promise<Reward> => {
    const res = await fetch(`${API_BASE}/rewards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reward),
    });
    return res.json();
  },

  deleteReward: async (id: string): Promise<void> => {
    await fetch(`${API_BASE}/rewards/${id}`, { method: 'DELETE' });
  },

  // History
  getHistory: async (userId: string): Promise<DisposalRecord[]> => {
    const res = await fetch(`${API_BASE}/history/${userId}`);
    return res.json();
  },

  addHistory: async (record: Omit<DisposalRecord, 'id'>): Promise<void> => {
    await fetch(`${API_BASE}/history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    });
  },

  // Leaderboard
  getLeaderboard: async (): Promise<User[]> => {
    const res = await fetch(`${API_BASE}/leaderboard`);
    return res.json();
  },

  // User Profile
  getUser: async (id: string): Promise<User> => {
    const res = await fetch(`${API_BASE}/users/${id}`);
    return res.json();
  },

  // Admin
  getAllDisposals: async (): Promise<(DisposalRecord & { userName: string; facilityName: string })[]> => {
    const res = await fetch(`${API_BASE}/admin/disposals`);
    return res.json();
  },

  updateDisposalStatus: async (id: string, status: 'approved' | 'rejected', creditsEarned: number): Promise<void> => {
    const res = await fetch(`${API_BASE}/admin/disposals/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, creditsEarned }),
    });
    if (!res.ok) throw new Error('Failed to update status');
  },

  getAllUsers: async (): Promise<User[]> => {
    const res = await fetch(`${API_BASE}/admin/users`);
    return res.json();
  },

  getSettings: async (): Promise<any> => {
    const res = await fetch(`${API_BASE}/settings`);
    return res.json();
  },

  updateSettings: async (settings: any): Promise<void> => {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    if (!res.ok) throw new Error('Failed to update settings');
  },

  // Gemini AI - Find nearby e-waste centers
  findNearbyFacilitiesWithAI: async (latitude: number, longitude: number, radiusKm: number = 50): Promise<any> => {
    const geminiApiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (process.env as any)?.GEMINI_API_KEY;
    
    if (!geminiApiKey) {
      throw new Error('Gemini API key not found');
    }

    const prompt = `You are an e-waste recycling center finder. Given the user's location at latitude ${latitude} and longitude ${longitude}, find and list nearby authorized e-waste recycling centers within ${radiusKm}km radius. 
    
    For each center, provide:
    1. Name
    2. Address
    3. City
    4. Phone number
    5. Approximate distance in km
    6. Types of items accepted (e.g., Mobile, Laptop, Battery, Monitor, etc.)
    7. Working hours
    
    Format the response as a JSON array with objects containing: name, address, city, phone, distance, acceptedItems (array), hours.
    
    Return ONLY valid JSON, no other text.`;

    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + encodeURIComponent(geminiApiKey), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
          },
          safetySettings: [
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_NONE',
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error('Gemini API request failed');
      }

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!content) {
        throw new Error('No response from Gemini API');
      }

      // Parse the JSON response from Gemini
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('Invalid JSON response from Gemini');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Error finding facilities with Gemini:', error);
      throw error;
    }
  }
};
