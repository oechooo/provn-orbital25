import React, { useState } from 'react';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface OutcomeWidgetProps {
  marketId: number;
  currentOutcome: boolean | null;
  onClose: () => void;
  onSuccess?: () => void;
}

const OutcomeWidget: React.FC<OutcomeWidgetProps> = ({
  marketId,
  currentOutcome,
  onClose,
  onSuccess
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSetOutcome = async (outcome: boolean | null) => {
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/markets/${marketId}/set-outcome`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ outcome }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to set outcome' }));
        throw new Error(errorData.message || 'Failed to set outcome');
      }

      const outcomeText = outcome === null ? 'NONE' : outcome ? 'TRUE' : 'FALSE';
      toast.success(`Market outcome set to ${outcomeText}`);
      
      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to set market outcome');
    } finally {
      setIsLoading(false);
    }
  };

  // Close on escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const getOutcomeDisplay = (outcome: boolean | null) => {
    if (outcome === null) return 'NONE';
    return outcome ? 'TRUE' : 'FALSE';
  };

  const getOutcomeColor = (outcome: boolean | null) => {
    if (outcome === null) return 'text-slate-400';
    return outcome ? 'text-green-400' : 'text-red-400';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl border border-slate-600 p-6 w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-slate-100">
            Set Market Outcome
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-xl"
            disabled={isLoading}
          >
            ×
          </button>
        </div>

        {/* Current outcome display */}
        <div className="mb-6 p-3 bg-slate-700/50 rounded-lg">
          <div className="text-sm text-slate-300 mb-1">Current Outcome</div>
          <div className={`text-lg font-bold ${getOutcomeColor(currentOutcome)}`}>
            {getOutcomeDisplay(currentOutcome)}
          </div>
        </div>

        {/* Outcome selection */}
        <div className="space-y-3 mb-6">
          <p className="text-slate-300 text-sm">Choose the new outcome for this market:</p>
          
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => handleSetOutcome(null)}
              disabled={isLoading}
              className={`p-3 rounded-lg border transition-all font-bold ${
                currentOutcome === null
                  ? 'bg-slate-600 border-slate-500 text-slate-300'
                  : 'border-slate-600 text-slate-400 hover:border-slate-500 hover:bg-slate-700/50'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              NONE
            </button>
            
            <button
              onClick={() => handleSetOutcome(true)}
              disabled={isLoading}
              className={`p-3 rounded-lg border transition-all font-bold ${
                currentOutcome === true
                  ? 'bg-green-600 border-green-500 text-white'
                  : 'border-slate-600 text-green-400 hover:border-green-500 hover:bg-green-600/20'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              TRUE
            </button>
            
            <button
              onClick={() => handleSetOutcome(false)}
              disabled={isLoading}
              className={`p-3 rounded-lg border transition-all font-bold ${
                currentOutcome === false
                  ? 'bg-red-600 border-red-500 text-white'
                  : 'border-slate-600 text-red-400 hover:border-red-500 hover:bg-red-600/20'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              FALSE
            </button>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-500 text-slate-200 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default OutcomeWidget;
