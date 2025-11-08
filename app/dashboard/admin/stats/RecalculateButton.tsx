'use client';

import { useState } from 'react';

interface RecalculateButtonProps {
  onRecalculate: () => Promise<{ success: boolean; matchesProcessed: number }>;
}

export default function RecalculateButton({ onRecalculate }: RecalculateButtonProps) {
  const [isRecalculating, setIsRecalculating] = useState(false);

  const handleClick = async () => {
    if (!confirm('Are you sure you want to recalculate all ELO ratings?\n\nThis will reset everyone to 1500 and recalculate based on match history.')) {
      return;
    }

    setIsRecalculating(true);
    try {
      const result = await onRecalculate();
      if (result.success) {
        alert(`✅ ELO Recalculation Complete!\n\n${result.matchesProcessed} matches processed.\n\nAll ratings have been updated.`);
        window.location.reload();
      }
    } catch (error) {
      alert('❌ Error during recalculation. Please check the logs.');
      console.error(error);
    } finally {
      setIsRecalculating(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isRecalculating}
      className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
    >
      {isRecalculating ? '⏳ Recalculating...' : '🔄 Recalculate All ELO Ratings'}
    </button>
  );
}

