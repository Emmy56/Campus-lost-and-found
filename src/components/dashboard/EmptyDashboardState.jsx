import React from 'react';
import { AlertCircle, Sparkles } from 'lucide-react';

export default function EmptyDashboardState({ type, onStartReporting }) {
  if (type === 'logged-items') {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 font-sans">
        <AlertCircle className="w-12 h-12 text-gray-300" />
        <div>
          <h3 className="font-bold text-gray-800">No items logged yet</h3>
          <p className="text-sm text-gray-400 mt-1 max-w-xs">
            Have you lost or found something on campus? Log it now to start finding matches.
          </p>
        </div>
        {onStartReporting && (
          <div className="flex gap-2">
            <button
              onClick={() => onStartReporting('lost')}
              className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Log Lost Item
            </button>
            <button
              onClick={() => onStartReporting('found')}
              className="px-4 py-2 bg-green-50 text-green-600 hover:bg-green-100 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Log Found Item
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 font-sans">
      <Sparkles className="w-12 h-12 text-blue-200" />
      <div>
        <h3 className="font-bold text-gray-800">No matches found yet</h3>
        <p className="text-sm text-gray-400 mt-1 max-w-xs">
          Our matching engine runs automatically. We will notify you once potential matches are found.
        </p>
      </div>
    </div>
  );
}
