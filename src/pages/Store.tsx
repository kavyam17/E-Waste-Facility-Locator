import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { Reward } from '../types';
import { toast } from 'sonner';
import { ShoppingBag, Coins, Gift, Tag, Package, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

const Store: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [redeeming, setRedeeming] = useState<string | null>(null);

  useEffect(() => {
    const loadRewards = async () => {
      try {
        const data = await api.getRewards();
        setRewards(data);
      } catch (err) {
        console.error("Failed to load rewards", err);
      }
    };
    loadRewards();
  }, []);

  const handleRedeem = async (reward: Reward) => {
    if (!user) return;

    if (user.credits < reward.cost) {
      toast.error('Insufficient credits to redeem this reward.');
      return;
    }

    setRedeeming(reward.id);

    try {
      await api.redeemReward(user.id, reward.id);
      
      // Refresh user data to update credits and rewards list
      const updatedUser = await api.getUser(user.id);
      updateUser(updatedUser);
      
      toast.success(`Successfully redeemed ${reward.name}! Check your rewards section.`);
    } catch (error: any) {
      toast.error(error.message || 'Redemption failed');
    } finally {
      setRedeeming(null);
    }
  };

  const getRewardIcon = (type: Reward['type']) => {
    switch (type) {
      case 'coupon': return <Tag className="h-6 w-6" />;
      case 'product': return <Package className="h-6 w-6" />;
      case 'voucher': return <Gift className="h-6 w-6" />;
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rewards Store</h1>
          <p className="text-gray-500">Redeem your hard-earned Eco Credits for sustainable rewards.</p>
        </div>
        <div className="flex items-center space-x-2 bg-yellow-100 text-yellow-700 px-6 py-3 rounded-2xl font-bold shadow-sm border border-yellow-200">
          <Coins className="h-6 w-6" />
          <span className="text-xl">{user?.credits || 0} Credits</span>
        </div>
      </header>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {rewards.map((reward) => {
          const canAfford = (user?.credits || 0) >= reward.cost;
          const isRedeeming = redeeming === reward.id;

          return (
            <motion.div
              key={reward.id}
              whileHover={{ y: -4 }}
              className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col"
            >
              <div className={cn(
                "h-48 flex items-center justify-center relative",
                reward.type === 'coupon' ? "bg-blue-50" : reward.type === 'product' ? "bg-green-50" : "bg-purple-50"
              )}>
                <div className={cn(
                  "p-6 rounded-2xl",
                  reward.type === 'coupon' ? "bg-blue-600 text-white" : reward.type === 'product' ? "bg-green-600 text-white" : "bg-purple-600 text-white"
                )}>
                  {getRewardIcon(reward.type)}
                </div>
                <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-gray-600 border border-white">
                  {reward.type}
                </div>
              </div>

              <div className="p-8 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{reward.name}</h3>
                <p className="text-gray-500 text-sm mb-6 flex-1">{reward.description}</p>
                
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center space-x-1 text-yellow-600 font-bold">
                    <Coins className="h-4 w-4" />
                    <span>{reward.cost}</span>
                  </div>
                  <button
                    disabled={!canAfford || isRedeeming}
                    onClick={() => handleRedeem(reward)}
                    className={cn(
                      "px-6 py-2 rounded-xl font-bold transition-all flex items-center space-x-2",
                      canAfford 
                        ? "bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-100" 
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    )}
                  >
                    {isRedeeming ? (
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <ShoppingBag className="h-4 w-4" />
                        <span>Redeem</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* My Rewards Section */}
      {user && user.rewards && user.rewards.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
            <Gift className="h-6 w-6 mr-2 text-purple-600" />
            My Redeemed Rewards
          </h2>
          <div className="grid gap-4">
            {user.rewards.map((reward, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gray-50 rounded-xl text-gray-400">
                    {getRewardIcon(reward.type)}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{reward.name}</h4>
                    <p className="text-xs text-gray-500">Redeemed on {new Date().toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-green-600 font-bold text-sm">
                  <Check className="h-4 w-4" />
                  <span>Active</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Store;
