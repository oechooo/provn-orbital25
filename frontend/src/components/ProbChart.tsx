import React, { useState, useEffect } from 'react';
import { marketAPI } from '../services/api';

interface ProbHistoryEntry {
  timestamp: string;
  probTrue: number;
  probFalse: number;
  stakeId: number;
  prediction: boolean;
  stakeAmount: number;
}

interface ProbChartProps {
  marketId: number;
  currentProbTrue: number;
  currentProbFalse: number;
  refreshTrigger?: number; // Add this to trigger refresh when value changes
}

const ProbChart: React.FC<ProbChartProps> = ({ 
  marketId, 
  currentProbTrue, 
  currentProbFalse,
  refreshTrigger = 0
}) => {
  const [probHistory, setProbHistory] = useState<ProbHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchProbHistory = async () => {
      try {
        setIsLoading(true);
        setError('');
        
        // Fetch the market data including probability history
        const response = await marketAPI.getMarketById(marketId);
        
        let market = response.market;
        const history = market?.probHistory || [];
        
        setProbHistory(history);
      } catch (err) {
        setError('Failed to load chart data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProbHistory();
  }, [marketId, refreshTrigger]); // Add refreshTrigger to dependencies

  // Calculate chart dimensions and scaling
  const chartWidth = 340;
  const chartHeight = 200;
  const padding = 40;
  const plotWidth = chartWidth - (2 * padding);
  const plotHeight = chartHeight - (2 * padding);

  // Calculate dynamic scale based on probability history
  const calculateScale = () => {
    if (probHistory.length === 0) {
      return { minScale: 0, maxScale: 1, minPercent: 0, maxPercent: 100 };
    }

    // Find min/max values from both TRUE and FALSE probabilities
    const allProbs = probHistory.flatMap(entry => [entry.probTrue, entry.probFalse]);
    const minProb = Math.min(...allProbs);
    const maxProb = Math.max(...allProbs);

    // Round to nearest 10% with some padding
    const minPercent = Math.max(0, Math.floor(minProb * 100 / 10) * 10);
    const maxPercent = Math.min(100, Math.ceil(maxProb * 100 / 10) * 10);

    return {
      minScale: minPercent / 100,
      maxScale: maxPercent / 100,
      minPercent,
      maxPercent
    };
  };

  const { minScale, maxScale, minPercent, maxPercent } = calculateScale();
  const scaleRange = maxScale - minScale;

  // Create SVG path for the probability line with dynamic scaling
  const createPath = (data: ProbHistoryEntry[], getValue: (entry: ProbHistoryEntry) => number) => {
    if (data.length === 0) return '';

    const points = data.map((entry, index) => {
      const x = padding + (index / Math.max(data.length - 1, 1)) * plotWidth;
      const normalizedValue = (getValue(entry) - minScale) / scaleRange;
      const y = padding + (1 - normalizedValue) * plotHeight; // Flip Y-axis
      return `${x},${y}`;
    });

    return `M ${points.join(' L ')}`;
  };

  const truePath = createPath(probHistory, (entry) => entry.probTrue);
  const falsePath = createPath(probHistory, (entry) => entry.probFalse);

  // Create grid lines with dynamic scaling
  const gridLines = [];
  for (let i = 0; i <= 4; i++) {
    const y = padding + (i / 4) * plotHeight;
    const percentage = maxPercent - (i / 4) * (maxPercent - minPercent);
    gridLines.push(
      <g key={i}>
        <line
          x1={padding}
          y1={y}
          x2={chartWidth - padding}
          y2={y}
          stroke="#374151"
          strokeWidth="1"
          strokeDasharray="2,2"
        />
        <text
          x={padding - 5}
          y={y + 4}
          fill="#9CA3AF"
          fontSize="10"
          textAnchor="end"
        >
          {Math.round(percentage)}%
        </text>
      </g>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-slate-800 rounded-xl border border-slate-600 p-6 w-full max-w-md">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
          <span className="ml-3 text-slate-400">Loading chart...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-800 rounded-xl border border-slate-600 p-6 w-full max-w-md">
        <div className="flex flex-col items-center justify-center h-64 text-slate-400">
          <div className="text-4xl mb-2">!</div>
          <p className="text-sm text-center">{error}</p>
        </div>
      </div>
    );
  }

  // If no probability history, show empty state
  if (probHistory.length === 0) {
    return (
      <div className="bg-slate-800 rounded-xl border border-slate-600 p-6 w-full max-w-md">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-slate-100 mb-2">Implied Probability Chart</h3>
        </div>
        
        <div className="flex flex-col items-center justify-center h-48 text-slate-400">
          <div className="text-4xl mb-3"></div>
          <p className="text-sm text-center mb-2">No trading history yet</p>
          <p className="text-xs text-center text-slate-500">
            Chart will appear after the first stake is placed
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-600 p-6 w-full max-w-md">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-xl font-bold text-slate-100 mb-1">Implied Probability Chart</h3>
        <div className="text-sm text-slate-400">
          {probHistory.length} trading event{probHistory.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Chart */}
      <div className="mb-4">
        <svg
          width={chartWidth}
          height={chartHeight}
          className="bg-slate-900/50 rounded-lg"
        >
          {/* Grid lines */}
          {gridLines}

          {/* Chart lines */}
          {truePath && (
            <path
              d={truePath}
              stroke="#10B981" // emerald-500
              strokeWidth="2"
              fill="none"
              className="drop-shadow-sm"
            />
          )}
          {falsePath && (
            <path
              d={falsePath}
              stroke="#EF4444" // red-500
              strokeWidth="2"
              fill="none"
              className="drop-shadow-sm"
            />
          )}

          {/* Data points */}
          {probHistory.map((entry, index) => {
            const x = padding + (index / Math.max(probHistory.length - 1, 1)) * plotWidth;
            const normalizedTrue = (entry.probTrue - minScale) / scaleRange;
            const normalizedFalse = (entry.probFalse - minScale) / scaleRange;
            const yTrue = padding + (1 - normalizedTrue) * plotHeight;
            const yFalse = padding + (1 - normalizedFalse) * plotHeight;

            return (
              <g key={entry.timestamp}>
                <circle
                  cx={x}
                  cy={yTrue}
                  r="3"
                  fill="#10B981"
                  className="opacity-80 hover:opacity-100"
                >
                  <title>
                    TRUE: {Math.round(entry.probTrue * 100)}% 
                    ({new Date(entry.timestamp).toLocaleTimeString()})
                  </title>
                </circle>
                <circle
                  cx={x}
                  cy={yFalse}
                  r="3"
                  fill="#EF4444"
                  className="opacity-80 hover:opacity-100"
                >
                  <title>
                    FALSE: {Math.round(entry.probFalse * 100)}%
                    ({new Date(entry.timestamp).toLocaleTimeString()})
                  </title>
                </circle>
              </g>
            );
          })}

        </svg>
      </div>

      {/* Legend */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></div>
            <span className="text-sm text-emerald-400 font-medium">
              TRUE ({Math.round(currentProbTrue * 100)}%)
            </span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <span className="text-sm text-red-400 font-medium">
              FALSE ({Math.round(currentProbFalse * 100)}%)
            </span>
          </div>
        </div>
      </div>

      {/* Latest activity */}
      {probHistory.length > 0 && (
        <div className="mt-4 p-3 bg-slate-700/30 rounded-lg">
          <div className="text-xs text-slate-400 mb-1">Latest Activity</div>
          <div className="text-sm text-slate-200">
            {probHistory[probHistory.length - 1].stakeAmount.toFixed(0)} PP on{' '}
            <span className={probHistory[probHistory.length - 1].prediction ? 'text-emerald-400' : 'text-red-400'}>
              {probHistory[probHistory.length - 1].prediction ? 'TRUE' : 'FALSE'}
            </span>
          </div>
          <div className="text-xs text-slate-500">
            {new Date(probHistory[probHistory.length - 1].timestamp).toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProbChart;
