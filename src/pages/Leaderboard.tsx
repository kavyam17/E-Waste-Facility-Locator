import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { User } from '../types';
import { Trophy, Award, Medal, TrendingUp, Search } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

const Leaderboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'credits' | 'disposals'>('credits');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await api.getLeaderboard();
        setUsers(data);
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const sortedUsers = [...users]
    .filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'credits') return b.credits - a.credits;
      return b.totalDisposed - a.totalDisposed;
    });

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 1: return <Medal className="h-6 w-6 text-gray-400" />;
      case 2: return <Medal className="h-6 w-6 text-amber-600" />;
      default: return <span className="text-lg font-bold text-gray-400">#{index + 1}</span>;
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leaderboard</h1>
          <p className="text-gray-500">See how you rank against other eco-warriors.</p>
        </div>
        <div className="flex bg-white p-1 rounded-xl border border-gray-200">
          <button
            onClick={() => setSortBy('credits')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              sortBy === 'credits' ? "bg-green-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-900"
            )}
          >
            By Credits
          </button>
          <button
            onClick={() => setSortBy('disposals')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              sortBy === 'disposals' ? "bg-green-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-900"
            )}
          >
            By Disposals
          </button>
        </div>
      </header>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search eco-warriors..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none shadow-sm transition-all"
        />
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-8 py-4 text-sm font-bold text-gray-500 uppercase tracking-wider">Rank</th>
                <th className="px-8 py-4 text-sm font-bold text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-8 py-4 text-sm font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-8 py-4 text-sm font-bold text-gray-500 uppercase tracking-wider text-right">
                  {sortBy === 'credits' ? 'Eco Credits' : 'Total Disposed'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center">
                    <div className="h-10 w-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : sortedUsers.length > 0 ? (
                sortedUsers.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-center w-10">
                        {getRankIcon(index)}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-2">
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        <span className="text-xs font-medium text-gray-600">Active Warrior</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <span className="text-lg font-bold text-gray-900">
                          {sortBy === 'credits' ? user.credits : user.totalDisposed}
                        </span>
                        {sortBy === 'credits' ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <Medal className="h-4 w-4 text-blue-500" />
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center text-gray-500">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
