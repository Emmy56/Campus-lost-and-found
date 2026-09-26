import React, { useState } from 'react';
import { X, Save, Trash2, MapPin, Calendar, Tag, FileText, Gift } from 'lucide-react';

const CATEGORIES = [
  'ID Cards & Documents',
  'Electronics & Gadgets',
  'Keys & Keychains',
  'Wallets, Purses & Bags',
  'Clothing, Footwear & Accessories',
  'Books & Study Materials',
  'Others'
];

export default function EditItemModal({ item, isOpen, onClose, onSave, onDelete }) {
  if (!isOpen || !item) return null;

  const [title, setTitle] = useState(item.title || '');
  const [category, setCategory] = useState(item.category || CATEGORIES[0]);
  const [location, setLocation] = useState(item.location || '');
  const [specificLocation, setSpecificLocation] = useState(item.specificLocation || '');
  const [date, setDate] = useState(item.date || '');
  const [description, setDescription] = useState(item.description || '');
  const [status, setStatus] = useState(item.status || 'active');
  const [reward, setReward] = useState(item.reward || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !location.trim() || !description.trim()) {
      alert('Please fill in all required fields (Title, Location, Description).');
      return;
    }

    setLoading(true);
    try {
      await onSave(item.id, {
        title: title.trim(),
        category,
        location: location.trim(),
        specificLocation: specificLocation.trim(),
        date,
        description: description.trim(),
        status,
        reward: reward.trim()
      });
      onClose();
    } catch (err) {
      alert(err.message || 'Failed to update item details.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to permanently delete "${item.title}"? This action cannot be undone.`)) {
      onDelete(item.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans animate-fade-in">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-lg font-extrabold text-gray-900">Edit Logged Item</h3>
            <p className="text-xs text-gray-500">Update item details or change report status</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs font-sans">
          {/* Title */}
          <div className="space-y-1">
            <label className="block font-bold text-gray-700">Item Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Black HP Laptop Bag"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Category & Status Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block font-bold text-gray-700">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:border-blue-500 bg-white"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-gray-700">Listing Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 bg-white"
              >
                <option value="active">Active (Searching/Open)</option>
                <option value="resolved">Resolved (Returned/Found)</option>
              </select>
            </div>
          </div>

          {/* Location & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block font-bold text-gray-700">Location *</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Hezekiah Oluwasanmi Library"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-gray-700">Date *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Specific Location */}
          <div className="space-y-1">
            <label className="block font-bold text-gray-700">Specific Spot / Room Details</label>
            <input
              type="text"
              value={specificLocation}
              onChange={(e) => setSpecificLocation(e.target.value)}
              placeholder="e.g. Floor 2 Reading Room, Table 14"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Reward (Optional) */}
          <div className="space-y-1">
            <label className="block font-bold text-gray-700">Optional Reward / Token of Thanks</label>
            <input
              type="text"
              value={reward}
              onChange={(e) => setReward(e.target.value)}
              placeholder="e.g. Cash reward or 🎁 Token of appreciation"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="block font-bold text-gray-700">Description *</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide identifiable description, colors, contents..."
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-3 shrink-0">
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              Delete Item
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors cursor-pointer shadow-sm flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
