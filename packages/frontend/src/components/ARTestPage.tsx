import React, { useState, useEffect, useRef } from 'react';
import ARScene from './ARScene';
import { TrackingStabilityConfig } from '../services/TrackingStabilizer';

interface TrackingMetrics {
  movementVelocity: number;
  historyLength: number;
  isJittering: boolean;
  currentSmoothingFactor: number;
  trackingAccuracy: number;
  frameRate: number;
}

export const ARTestPage: React.FC = () => {
  const [stabilityMode, setStabilityMode] = useState<'responsive' | 'stable' | 'ultra-stable'>('stable');
  const [metrics, setMetrics] = useState<TrackingMetrics | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [testScenario, setTestScenario] = useState<'normal' | 'jitter' | 'movement'>('normal');
  const metricsRef = useRef<HTMLDivElement>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev.slice(-9), `[${timestamp}] ${message}`]);
  };

  const handleTrackingStart = () => {
    setIsTracking(true);
    addLog(`Tracking started with ${stabilityMode} mode`);
  };

  const handleTrackingLost = () => {
    setIsTracking(false);
    addLog('Tracking lost');
  };

  const handleMetricsUpdate = (newMetrics: any) => {
    setMetrics({
      movementVelocity: newMetrics.movementVelocity || 0,
      historyLength: newMetrics.historyLength || 0,
      isJittering: newMetrics.isJittering || false,
      currentSmoothingFactor: newMetrics.currentSmoothingFactor || 0,
      trackingAccuracy: newMetrics.trackingAccuracy || 0,
      frameRate: newMetrics.frameRate || 0
    });
  };

  const handleStabilityModeChange = (mode: 'responsive' | 'stable' | 'ultra-stable') => {
    setStabilityMode(mode);
    addLog(`Switched to ${mode} mode`);
  };

  const startTestScenario = (scenario: 'normal' | 'jitter' | 'movement') => {
    setTestScenario(scenario);
    addLog(`Starting ${scenario} test scenario`);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6">AR Tracking Stability Test Environment</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* AR Scene */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">AR Scene</h2>
              <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
                <ARScene
                  stabilityMode={stabilityMode}
                  onTrackingStart={handleTrackingStart}
                  onTrackingLost={handleTrackingLost}
                  onMetricsUpdate={handleMetricsUpdate}
                />
                
                {/* Overlay Controls */}
                <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white p-3 rounded">
                  <div className="text-sm">
                    <div>Mode: <span className="font-semibold">{stabilityMode}</span></div>
                    <div>Status: <span className={`font-semibold ${isTracking ? 'text-green-400' : 'text-red-400'}`}>
                      {isTracking ? 'Tracking' : 'Not Tracking'}
                    </span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Control Panel */}
          <div className="space-y-6">
            {/* Stability Mode Controls */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Stability Mode</h3>
              <div className="space-y-2">
                {(['responsive', 'stable', 'ultra-stable'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => handleStabilityModeChange(mode)}
                    className={`w-full p-3 rounded-lg text-left transition-colors ${
                      stabilityMode === mode
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    <div className="font-semibold capitalize">{mode}</div>
                    <div className="text-sm opacity-75">
                      {mode === 'responsive' && 'Low latency, less stable'}
                      {mode === 'stable' && 'Balanced stability and responsiveness'}
                      {mode === 'ultra-stable' && 'Maximum stability, higher latency'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Test Scenarios */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Test Scenarios</h3>
              <div className="space-y-2">
                <button
                  onClick={() => startTestScenario('normal')}
                  className={`w-full p-2 rounded text-left ${
                    testScenario === 'normal' ? 'bg-blue-100' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Normal Use
                </button>
                <button
                  onClick={() => startTestScenario('jitter')}
                  className={`w-full p-2 rounded text-left ${
                    testScenario === 'jitter' ? 'bg-blue-100' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Hand Tremor Test
                </button>
                <button
                  onClick={() => startTestScenario('movement')}
                  className={`w-full p-2 rounded text-left ${
                    testScenario === 'movement' ? 'bg-blue-100' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Intentional Movement
                </button>
              </div>
            </div>
            
            {/* Real-time Metrics */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Tracking Metrics</h3>
              {metrics ? (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Movement Velocity:</span>
                    <span className="font-mono text-sm">{metrics.movementVelocity.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">History Length:</span>
                    <span className="font-mono text-sm">{metrics.historyLength}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Jittering:</span>
                    <span className={`font-mono text-sm ${metrics.isJittering ? 'text-red-500' : 'text-green-500'}`}>
                      {metrics.isJittering ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Smoothing Factor:</span>
                    <span className="font-mono text-sm">{metrics.currentSmoothingFactor.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Frame Rate:</span>
                    <span className="font-mono text-sm">{metrics.frameRate.toFixed(0)} FPS</span>
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 text-sm">No tracking data available</div>
              )}
            </div>
          </div>
        </div>
        
        {/* Test Instructions */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Testing Instructions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-semibold mb-2">🎯 Normal Use Test</h4>
              <ol className="text-sm space-y-1 text-gray-600">
                <li>1. Point camera at brochure target</li>
                <li>2. Hold steady for 5 seconds</li>
                <li>3. Make small adjustments</li>
                <li>4. Observe model stability</li>
              </ol>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-semibold mb-2">🤝 Hand Tremor Test</h4>
              <ol className="text-sm space-y-1 text-gray-600">
                <li>1. Point at target</li>
                <li>2. Simulate hand tremor</li>
                <li>3. Try different stability modes</li>
                <li>4. Compare jitter reduction</li>
              </ol>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-semibold mb-2">🚀 Movement Test</h4>
              <ol className="text-sm space-y-1 text-gray-600">
                <li>1. Point at target</li>
                <li>2. Move camera intentionally</li>
                <li>3. Test responsiveness</li>
                <li>4. Verify tracking follows</li>
              </ol>
            </div>
          </div>
        </div>
        
        {/* Activity Log */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Activity Log</h3>
            <button
              onClick={clearLogs}
              className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
            >
              Clear
            </button>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 max-h-40 overflow-y-auto">
            {logs.length > 0 ? (
              <div className="space-y-1">
                {logs.map((log, index) => (
                  <div key={index} className="text-sm font-mono text-gray-700">
                    {log}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-sm">No activity yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ARTestPage; 