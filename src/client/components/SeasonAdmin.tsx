/**
 * Season Admin Component
 * 
 * Simple admin button to manually advance seasons.
 * Only shows in development mode.
 */

import { useState } from 'react';

export const SeasonAdmin = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Only show in playtest mode (when URL contains 'playtest')
  // This means only you (the developer) will see it during testing
  // Regular users on the published app won't see it
  const isPlaytest = window.location.search.includes('playtest') || 
                     window.location.hostname.includes('localhost');

  if (!isPlaytest) return null;

  const advanceSeason = async () => {
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/season/start-new-simple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`✅ Season ${data.seasonNumber} started!`);
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setMessage(`❌ Error: ${data.message}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-gray-800 border border-yellow-500 rounded-lg p-3 shadow-lg">
        <div className="text-xs text-yellow-400 mb-2 font-semibold">🔧 DEV TOOLS</div>
        <button
          onClick={advanceSeason}
          disabled={loading}
          className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '⏳ Starting...' : '🚀 Start Next Season'}
        </button>
        {message && (
          <div className="mt-2 text-xs text-white">
            {message}
          </div>
        )}
      </div>
    </div>
  );
};
