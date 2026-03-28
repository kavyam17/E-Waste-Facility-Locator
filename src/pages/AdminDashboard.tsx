import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { DisposalRecord, User, AppSettings, Reward } from '../types';
import { formatDate, cn } from '../lib/utils';
import { ShieldCheck, Users, Recycle, Clock, CheckCircle, XCircle, Settings, Save, AlertTriangle, Gift, Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

type AdminDisposal = DisposalRecord & { userName: string; facilityName: string };

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [disposals, setDisposals] = useState<AdminDisposal[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'approvals' | 'users' | 'rewards' | 'settings'>('approvals');
  const [settings, setSettings] = useState<AppSettings>({
    minCredits: 10,
    maxCredits: 500,
    autoApprove: false,
    maintenanceMode: false
  });

  const [newReward, setNewReward] = useState<Partial<Reward>>({
    name: '',
    cost: 0,
    type: 'coupon',
    description: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      if (user?.role === 'admin') {
        try {
          const [disposalsData, usersData, rewardsData, settingsData] = await Promise.all([
            api.getAllDisposals(),
            api.getAllUsers(),
            api.getRewards(),
            api.getSettings()
          ]);
          setDisposals(disposalsData);
          setUsers(usersData);
          setRewards(rewardsData);
          if (settingsData && Object.keys(settingsData).length > 0) {
            setSettings(settingsData);
          }
        } catch (error) {
          console.error('Failed to fetch admin data:', error);
          toast.error('Failed to load dashboard data');
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchData();
  }, [user]);

  const handleAddReward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReward.name || !newReward.cost || !newReward.description) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const reward = await api.addReward({
        name: newReward.name!,
        cost: Number(newReward.cost),
        type: newReward.type as any,
        description: newReward.description!
      });
      setRewards([...rewards, reward]);
      setNewReward({ name: '', cost: 0, type: 'coupon', description: '' });
      toast.success('Reward added successfully');
    } catch (error) {
      toast.error('Failed to add reward');
    }
  };

  const handleDeleteReward = async (id: string) => {
    try {
      await api.deleteReward(id);
      setRewards(rewards.filter(r => r.id !== id));
      toast.success('Reward deleted');
    } catch (error) {
      toast.error('Failed to delete reward');
    }
  };

  const handleVerification = async (disposalId: string, status: 'approved' | 'rejected') => {
    const disposal = disposals.find(d => d.id === disposalId);
    if (!disposal || disposal.status !== 'pending') return;

    try {
      // Calculate credits (hardcoded 10 per kg for now, or fetch from settings)
      const creditsEarned = status === 'approved' ? Math.round(disposal.weight * 10) : 0;
      
      await api.updateDisposalStatus(disposalId, status, creditsEarned);
      
      // Update local state
      setDisposals(disposals.map(d => d.id === disposalId ? { ...d, status, creditsEarned } : d));
      
      // Refresh users to show updated credits
      const usersData = await api.getAllUsers();
      setUsers(usersData);
      
      toast.success(`Disposal ${status} successfully.`);
    } catch (error) {
      toast.error('Failed to process disposal');
    }
  };

  const handleSaveSettings = async () => {
    try {
      await api.updateSettings(settings);
      toast.success('Settings updated successfully.');
    } catch (error) {
      toast.error('Failed to update settings');
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="text-center py-20">
        <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-gray-500">You do not have permission to view this page.</p>
      </div>
    );
  }

  const pendingCount = disposals.filter(d => d.status === 'pending').length;
  const approvedCount = disposals.filter(d => d.status === 'approved').length;

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Control Center</h1>
          <p className="text-gray-500">Manage verifications, users, and system settings.</p>
        </div>
        <div className="flex bg-white p-1 rounded-xl border border-gray-200">
          <button
            onClick={() => setActiveTab('approvals')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2",
              activeTab === 'approvals' ? "bg-green-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-900"
            )}
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Approvals</span>
            {pendingCount > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{pendingCount}</span>}
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2",
              activeTab === 'users' ? "bg-green-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-900"
            )}
          >
            <Users className="h-4 w-4" />
            <span>Users</span>
          </button>
          <button
            onClick={() => setActiveTab('rewards')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2",
              activeTab === 'rewards' ? "bg-green-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-900"
            )}
          >
            <Gift className="h-4 w-4" />
            <span>Rewards</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2",
              activeTab === 'settings' ? "bg-green-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-900"
            )}
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </button>
        </div>
      </header>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-sm font-medium text-gray-500 uppercase">Total Users</p>
          <p className="text-3xl font-bold mt-1">{users.filter(u => u.role === 'user').length}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-sm font-medium text-gray-500 uppercase">Total Disposals</p>
          <p className="text-3xl font-bold mt-1">{disposals.length}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-sm font-medium text-gray-500 uppercase">Pending</p>
          <p className="text-3xl font-bold mt-1 text-yellow-600">{pendingCount}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-sm font-medium text-gray-500 uppercase">Approved</p>
          <p className="text-3xl font-bold mt-1 text-green-600">{approvedCount}</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'approvals' && (
          <motion.div
            key="approvals"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <h2 className="text-xl font-bold text-gray-900">Verification Queue</h2>
            <div className="grid gap-4">
              {isLoading ? (
                <div className="flex justify-center py-20">
                  <div className="h-12 w-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : disposals.filter(d => d.status === 'pending').length > 0 ? (
                disposals.filter(d => d.status === 'pending').map((disposal) => (
                  <div key={disposal.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col lg:flex-row gap-6">
                    <div className="h-48 lg:h-32 lg:w-48 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                      <img src={disposal.proofUrl} alt="Proof" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between">
                         <h3 className="text-lg font-bold text-gray-900">{disposal.itemName}</h3>
                        <span className="text-xs font-bold text-gray-400 uppercase">{formatDate(disposal.date)}</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        <span className="font-bold">User:</span> {disposal.userName}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-bold">Facility:</span> {disposal.facilityName}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-bold">Weight:</span> {disposal.weight} kg
                      </p>
                      {disposal.weight > 50 && (
                        <div className="flex items-center space-x-1 text-amber-600 bg-amber-50 px-2 py-1 rounded-md w-fit text-xs font-bold">
                          <AlertTriangle className="h-3 w-3" />
                          <span>High weight flagged</span>
                        </div>
                      )}
                    </div>
                    <div className="flex lg:flex-col justify-end gap-2">
                      <button
                        onClick={() => handleVerification(disposal.id, 'approved')}
                        className="flex-1 lg:flex-none px-6 py-2 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all flex items-center justify-center space-x-2"
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleVerification(disposal.id, 'rejected')}
                        className="flex-1 lg:flex-none px-6 py-2 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-all flex items-center justify-center space-x-2"
                      >
                        <XCircle className="h-4 w-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                  <CheckCircle className="h-12 w-12 text-green-200 mx-auto mb-4" />
                  <p className="text-gray-500">Queue is empty! All disposals have been processed.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'rewards' && (
          <motion.div
            key="rewards"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Plus className="h-5 w-5 mr-2 text-green-600" />
                Add New Reward
              </h2>
              <form onSubmit={handleAddReward} className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Reward Name</label>
                    <input
                      type="text"
                      value={newReward.name}
                      onChange={(e) => setNewReward({ ...newReward, name: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
                      placeholder="e.g., $50 Amazon Gift Card"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Cost (Credits)</label>
                    <input
                      type="number"
                      value={newReward.cost}
                      onChange={(e) => setNewReward({ ...newReward, cost: Number(e.target.value) })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Type</label>
                    <select
                      value={newReward.type}
                      onChange={(e) => setNewReward({ ...newReward, type: e.target.value as any })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
                    >
                      <option value="coupon">Coupon</option>
                      <option value="product">Product</option>
                      <option value="voucher">Voucher</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                    <textarea
                      value={newReward.description}
                      onChange={(e) => setNewReward({ ...newReward, description: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none h-32 resize-none"
                      placeholder="Describe the reward..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-100"
                  >
                    Create Reward
                  </button>
                </div>
              </form>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Existing Rewards</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rewards.map((reward) => (
                  <div key={reward.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-gray-50 rounded-xl text-gray-400">
                        <Gift className="h-6 w-6" />
                      </div>
                      <button
                        onClick={() => handleDeleteReward(reward.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <h3 className="font-bold text-gray-900">{reward.name}</h3>
                    <p className="text-xs text-gray-500 mb-4 uppercase font-bold tracking-wider">{reward.type}</p>
                    <p className="text-sm text-gray-600 flex-1 mb-4">{reward.description}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                      <span className="text-lg font-bold text-green-600">{reward.cost} Credits</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'users' && (
          <motion.div
            key="users"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
          >
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">User</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Disposals</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Credits</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Badges</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map(u => (
                  <tr key={u.id}>
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900">{u.name}</p>
                      <p className="text-xs text-gray-500">{u.email}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{u.totalDisposed} kg</td>
                    <td className="px-6 py-4 font-bold text-green-600">{u.credits}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center text-[10px] font-bold text-purple-700">
                          #{u.rank}
                        </div>
                        <span className="text-xs text-gray-500">Global Rank</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-xl bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6"
          >
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <Settings className="h-5 w-5 mr-2 text-gray-400" />
              System Configuration
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Points Per Kilogram</label>
                <input
                  type="number"
                  value={settings.pointsPerKg}
                  onChange={(e) => setSettings({ ...settings, pointsPerKg: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
                />
                <p className="text-xs text-gray-400 mt-1">Number of credits awarded for every 1kg of verified e-waste.</p>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-bold text-gray-900">Enable Rewards Store</p>
                  <p className="text-xs text-gray-500">Allow users to redeem credits for rewards.</p>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, rewardsEnabled: !settings.rewardsEnabled })}
                  className={cn(
                    "w-12 h-6 rounded-full transition-all relative",
                    settings.rewardsEnabled ? "bg-green-600" : "bg-gray-300"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                    settings.rewardsEnabled ? "right-1" : "left-1"
                  )} />
                </button>
              </div>
            </div>

            <button
              onClick={handleSaveSettings}
              className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-black transition-all flex items-center justify-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>Save Changes</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
