import React from 'react';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import { Recycle, Award, Coins, CheckCircle, TrendingUp, Trophy } from 'lucide-react';
import { motion } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { cn } from '../lib/utils';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  const badgeConfig = [
    { name: 'Bronze', limit: 5, color: 'bg-orange-400' },
    { name: 'Silver', limit: 15, color: 'bg-gray-400' },
    { name: 'Gold', limit: 30, color: 'bg-yellow-400' }
  ];

  const nextBadge = badgeConfig.find(b => user.totalDisposed < b.limit) || badgeConfig[2];
  const progress = Math.min((user.totalDisposed / nextBadge.limit) * 100, 100);

  const chartData = [
    { name: 'Total', value: user.totalDisposed },
    { name: 'Credits', value: user.credits },
  ];

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.name}!</h1>
          <p className="text-gray-500">Here's your environmental impact summary.</p>
        </div>
        <div className="flex items-center space-x-2 bg-green-100 text-green-700 px-4 py-2 rounded-full font-bold">
          <Coins className="h-5 w-5" />
          <span>{user.credits} Credits</span>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Disposed"
          value={user.totalDisposed}
          icon={Recycle}
          color="bg-blue-500"
          description="Total items submitted"
        />
        <StatCard
          title="Eco Credits"
          value={user.credits}
          icon={Coins}
          color="bg-yellow-500"
          description="Available to redeem"
        />
        <StatCard
          title="Global Rank"
          value={`#${user.rank}`}
          icon={Trophy}
          color="bg-purple-500"
          description="Your position on leaderboard"
        />
        <StatCard
          title="Rewards"
          value={user.rewards?.length || 0}
          icon={Award}
          color="bg-green-500"
          description="Coupons & vouchers"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Badge Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-gray-900">Badge Progression</h2>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between text-sm font-medium">
              <span className="text-gray-500">Next Milestone: <span className="text-gray-900 font-bold">{nextBadge.name}</span></span>
              <span className="text-green-600">{user.totalDisposed} / {nextBadge.limit} Disposals</span>
            </div>
            <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={cn("h-full rounded-full", nextBadge.color)}
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4 pt-4">
              {badgeConfig.map((badge) => (
                <div 
                  key={badge.name}
                  className={cn(
                    "p-4 rounded-xl border flex flex-col items-center text-center transition-all",
                    user.totalDisposed >= badge.limit 
                      ? "bg-green-50 border-green-200" 
                      : "bg-gray-50 border-gray-100 opacity-50"
                  )}
                >
                  <Award className={cn(
                    "h-8 w-8 mb-2",
                    user.totalDisposed >= badge.limit ? "text-green-600" : "text-gray-400"
                  )} />
                  <span className="text-sm font-bold">{badge.name}</span>
                  <span className="text-xs text-gray-500">{badge.limit} items</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Activity Summary Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-8">Activity Summary</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: '#f3f4f6' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#3b82f6' : '#f59e0b'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 rounded-full bg-blue-500" />
                <span className="text-gray-600">Total Submitted</span>
              </div>
              <span className="font-bold">{user.totalDisposed}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                <span className="text-gray-600">Eco Credits Earned</span>
              </div>
              <span className="font-bold">{user.credits}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
