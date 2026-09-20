import React, { useState, useRef } from 'react';
import { Upload, ArrowLeft, Camera, Sparkles, X } from 'lucide-react';

export default function ReportForm({ type, onCancel, onSubmit }) {
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [specificLocation, setSpecificLocation] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [reward, setReward] = useState('');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef(null);

  const categories = [
    'Electronics',
    'Bags & Wallets',
    'Documents & Books',
    'Keys',
    'Clothing & Accessories',
    'Others'
  ];

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (!event.target?.result) return;
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round(height * (MAX_WIDTH / width));
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round(width * (MAX_HEIGHT / height));
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setUploadedImage(dataUrl);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setUploadedImage(null);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!itemName || !category || !description || !location || !date) {
      alert('Please fill out all required fields marked with *');
      return;
    }

    onSubmit({
      title: itemName,
      type,
      category,
      description,
      location,
      specificLocation,
      date,
      time,
      image: uploadedImage || undefined,
      reward: type === 'lost' ? reward : undefined
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">
      {/* Back Button and Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onCancel}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer text-gray-700"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {type === 'lost' ? 'Report a Lost Item' : 'Report a Found Item'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {type === 'lost'
              ? 'Provide detailed information to help us find your item.'
              : 'Help someone find their lost item by providing as much detail as possible.'}
          </p>
        </div>
      </div>

      {/* Main Form Card Container */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Item Name */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Item Name *
            </label>
            <input
              type="text"
              required
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder={type === 'lost' ? 'e.g., Silver MacBook Air, Red Water Bottle' : 'e.g., iPhone 15 Pro, Blue Backpack'}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Category *
            </label>
            <select
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors cursor-pointer text-gray-700"
            >
              <option value="" disabled>Select category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Detailed Description */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Detailed Description *
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                type === 'lost'
                  ? 'Include unique identifiers: stickers, scratches, serial numbers, contents, etc.'
                  : 'Include color, brand, size, unique features, condition, etc.'
              }
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors resize-y leading-relaxed"
            />
            <p className="text-[11px] text-gray-400">
              {type === 'lost'
                ? 'Be specific - this helps verify the item belongs to you'
                : 'Tip: More details help us match with lost items faster'}
            </p>
          </div>

          {/* Location details (2 Columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                {type === 'lost' ? 'Last Known Location *' : 'Location Found *'}
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Library 2nd Floor, Cafeteria"
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                {type === 'lost' ? 'Specific Area' : 'Specific Location'}
              </label>
              <input
                type="text"
                value={specificLocation}
                onChange={(e) => setSpecificLocation(e.target.value)}
                placeholder={type === 'lost' ? 'e.g., study room 203, near cafe' : 'e.g., 2nd floor, near entrance'}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Date and Time (2 Columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                {type === 'lost' ? 'Date Lost *' : 'Date Found *'}
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors text-gray-700"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                {type === 'lost' ? 'Approximate Time' : 'Time Found'}
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors text-gray-700"
              />
            </div>
          </div>

          {/* Photos Upload Section */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              {type === 'lost' ? 'Reference Photos (If Available)' : 'Photos (Optional)'}
            </label>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              accept="image/*"
              className="hidden"
            />

            {uploadedImage ? (
              <div className="relative border border-gray-100 rounded-xl overflow-hidden group aspect-video max-h-56 bg-gray-50 flex items-center justify-center">
                <img
                  src={uploadedImage}
                  alt="Uploaded attachment"
                  className="max-h-full object-contain"
                  referrerPolicy="no-referrer"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={triggerFileSelect}
                className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors ${
                  dragActive
                    ? 'border-blue-500 bg-blue-50/20'
                    : 'border-gray-300 hover:border-gray-400 bg-white'
                }`}
              >
                <div className="p-3 bg-gray-50 rounded-full border border-gray-100 text-gray-400">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-700">
                    {type === 'lost' ? 'Click to upload reference photos' : 'Click to upload photos'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB</p>
                </div>
              </div>
            )}
          </div>

          {/* Reward Offered (For Lost Items only) */}
          {type === 'lost' && (
            <div className="space-y-2 pt-2">
              <label className="block text-sm font-semibold text-gray-700">
                Reward Offered (Optional)
              </label>
              <input
                type="text"
                value={reward}
                onChange={(e) => setReward(e.target.value)}
                placeholder="e.g., $20, Coffee gift card"
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 bg-[#E5E7EB] hover:bg-gray-300 text-gray-700 text-sm font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-6 py-3 text-white text-sm font-bold rounded-xl transition-all shadow-sm cursor-pointer ${
                type === 'lost'
                  ? 'bg-[#EA580C] hover:bg-[#C2410C]' // Lost item orange button
                  : 'bg-[#00B050] hover:bg-green-700' // Found item green button
              }`}
            >
              {type === 'lost' ? 'Submit Lost Item Report' : 'Submit Found Item'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
