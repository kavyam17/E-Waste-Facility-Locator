import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { toast } from 'sonner';
import { Upload as UploadIcon, Camera, Weight, Trash2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

const Upload: React.FC = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    wasteType: '',
    weight: '',
    notes: ''
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const wasteTypes = [
    "Mobile Phone", "Laptop", "Tablet", "Monitor", "CPU", "Printer", 
    "Battery", "Charger/Cable", "Television", "Kitchen Appliance", "Other"
  ];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!imagePreview) {
      toast.error('Please upload a photo proof of disposal');
      return;
    }

    setIsSubmitting(true);

    try {
      const weightNum = parseFloat(formData.weight);
      const creditsEarned = Math.floor(weightNum * 10); // Simple logic: 10 credits per kg

      await api.addHistory({
        userId: user.id,
        facilityId: 'F001', // Default for now
        itemName: formData.wasteType,
        category: 'E-Waste',
        weight: weightNum,
        creditsEarned,
        date: new Date().toISOString(),
        status: 'pending',
        proofUrl: imagePreview
      });

      // Refresh user data
      const updatedUser = await api.getUser(user.id);
      updateUser(updatedUser);

      toast.success('Disposal proof uploaded successfully! Awaiting admin verification.');
      navigate('/history');
    } catch (err) {
      toast.error('Failed to submit disposal proof');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Upload Disposal Proof</h1>
        <p className="text-gray-500">Submit your recycling proof to earn Eco Credits.</p>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">E-Waste Type</label>
            <select
              required
              value={formData.wasteType}
              onChange={(e) => setFormData({ ...formData, wasteType: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
            >
              <option value="">Select type...</option>
              {wasteTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Approx Weight (kg)</label>
            <div className="relative">
              <Weight className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="number"
                step="0.1"
                required
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
                placeholder="0.0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Photo Proof</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-green-500 transition-colors cursor-pointer relative group">
              {imagePreview ? (
                <div className="relative w-full h-64">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full h-full object-contain rounded-lg"
                    referrerPolicy="no-referrer"
                  />
                  <button
                    type="button"
                    onClick={() => setImagePreview(null)}
                    className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-lg"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-1 text-center">
                  <Camera className="mx-auto h-12 w-12 text-gray-400 group-hover:text-green-500 transition-colors" />
                  <div className="flex text-sm text-gray-600">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none">
                      <span>Upload a file</span>
                      <input type="file" className="sr-only" accept="image/*" onChange={handleImageChange} />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Optional Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none h-24 resize-none"
              placeholder="Any additional details..."
            />
          </div>

          <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <p className="text-sm text-blue-800">
              Ensure the photo clearly shows the items being recycled. Verification usually takes 24-48 hours.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition-all shadow-lg shadow-green-100 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <UploadIcon className="h-5 w-5" />
                <span>Submit for Verification</span>
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Upload;
