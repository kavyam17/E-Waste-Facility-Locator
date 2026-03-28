import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { DisposalRecord } from '../types';
import { formatDate, cn } from '../lib/utils';
import { History as HistoryIcon, Clock, CheckCircle2, XCircle, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const History: React.FC = () => {
  const { user } = useAuth();
  const [disposals, setDisposals] = useState<DisposalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    const fetchHistory = async () => {
      if (user) {
        try {
          const data = await api.getHistory(user.id);
          setDisposals(data);
        } catch (error) {
          console.error('Failed to fetch history:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchHistory();
  }, [user]);

  const filteredDisposals = disposals.filter(d => filter === 'all' || d.status === filter);

  const statusConfig = {
    pending: { color: 'text-yellow-600 bg-yellow-50 border-yellow-100', icon: Clock },
    approved: { color: 'text-green-600 bg-green-50 border-green-100', icon: CheckCircle2 },
    rejected: { color: 'text-red-600 bg-red-50 border-red-100', icon: XCircle }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Disposal History</h1>
          <p className="text-gray-500">Track the status of your recycling submissions.</p>
        </div>
        <div className="flex bg-white p-1 rounded-xl border border-gray-200">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all",
                filter === f ? "bg-green-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-900"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </header>

      <div className="grid gap-4">
        <AnimatePresence mode="popLayout">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="h-12 w-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredDisposals.length > 0 ? (
            filteredDisposals.map((disposal) => {
              const config = statusConfig[disposal.status];
              return (
                <motion.div
                  key={disposal.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="flex items-center space-x-4">
                    <div className="h-16 w-16 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                      <img 
                        src={disposal.proofUrl} 
                        alt="Proof" 
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{disposal.itemName}</h3>
                      <p className="text-sm text-gray-500">{disposal.category} • {disposal.weight} kg</p>
                      <p className="text-xs text-gray-400 mt-1">{formatDate(disposal.date)}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    {disposal.creditsEarned > 0 && (
                      <div className="text-right">
                        <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Earned</p>
                        <p className="text-lg font-bold text-green-600">+{disposal.creditsEarned} Credits</p>
                      </div>
                    )}
                    <div className={cn(
                      "flex items-center space-x-2 px-4 py-2 rounded-full border text-sm font-bold capitalize",
                      config.color
                    )}>
                      <config.icon className="h-4 w-4" />
                      <span>{disposal.status}</span>
                    </div>
                    
                  </div>
                </motion.div>
              );
            })
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300"
            >
              <HistoryIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No disposal history found for this category.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default History;
