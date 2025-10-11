'use client';

import { useState, useEffect, useCallback } from 'react';
import { Agent } from '@/types/agent';
import { ReputationSummary } from '@/types/reputation';
import { Header } from '@/components/Header';

interface PerformanceMetrics {
  apr?: number;
  ltv?: number;
  aum?: number;
  volatility?: number;
  sharpeRatio?: number;
  maxDrawdown?: number;
  lastUpdated?: Date;
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [reputationSummary, setReputationSummary] = useState<ReputationSummary | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [performanceMetrics, setPerformanceMetrics] = useState<{[key: string]: PerformanceMetrics}>({});

  const fetchAgents = useCallback(async () => {
    try {
      const response = await fetch('/api/agents');
      const data = await response.json();
      if (data.success && data.data) {
        // Ensure data.data is an array
        const agentsData = Array.isArray(data.data) ? data.data : [];
        setAgents(agentsData);
        if (agentsData.length > 0 && !selectedAgentId) {
          setSelectedAgentId(agentsData[0].id);
        }
      } else {
        console.error('Failed to fetch agents:', data.error);
        setAgents([]);
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
      setAgents([]);
    }
  }, [selectedAgentId]);

  const fetchReputationSummary = async (agentId: string) => {
    try {
      const response = await fetch(`/api/agentbeat?agentId=${agentId}`);
      if (response.ok) {
        const data = await response.json();
        setReputationSummary(data);
      } else {
        console.error('Failed to fetch reputation summary');
        setReputationSummary(null);
      }
    } catch (error) {
      console.error('Error fetching reputation summary:', error);
      setReputationSummary(null);
    }
  };

  const fetchPerformanceMetrics = async (agentId: string) => {
    try {
      const response = await fetch(`/api/performance?agentId=${agentId}`);
      if (response.ok) {
        const data = await response.json();
        setPerformanceMetrics(prev => ({ ...prev, [agentId]: data }));
      }
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    fetchAgents();
  }, [fetchAgents]);

  useEffect(() => {
    if (selectedAgentId) {
      fetchReputationSummary(selectedAgentId);
      fetchPerformanceMetrics(selectedAgentId);
    }
  }, [selectedAgentId]);

  if (!isMounted) {
    return <div className="p-6">Loading...</div>;
  }

  // Ensure agents is always an array before using array methods
  const agentsArray = Array.isArray(agents) ? agents : [];
  const selectedAgent = agentsArray.find(agent => agent.id === selectedAgentId);
  const currentMetrics = performanceMetrics[selectedAgentId];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Agent Performance & Reputation</h1>
          <p className="mt-2 text-gray-600 dark:text-slate-300">
            Monitor agent performance metrics and reputation scores
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Agent Selection */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 md:p-6 overflow-hidden">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-slate-100">Select Agent</h2>
              {agentsArray.length > 0 ? (
                <select
                  value={selectedAgentId}
                  onChange={(e) => setSelectedAgentId(e.target.value)}
                  className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {agentsArray.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-sm text-gray-500 dark:text-slate-400">Loading agents...</p>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {selectedAgent ? (
              <div className="space-y-6">
                {/* Agent Overview */}
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 md:p-6 overflow-hidden">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100">{selectedAgent.name}</h2>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedAgent.credibilityTier === 'PLATINUM' ? 'bg-slate-100 text-slate-800' :
                      selectedAgent.credibilityTier === 'GOLD' ? 'bg-yellow-100 text-yellow-800' :
                      selectedAgent.credibilityTier === 'SILVER' ? 'bg-gray-100 text-gray-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {selectedAgent.credibilityTier}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 dark:text-slate-300 mb-4">{selectedAgent.metadata.description}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{selectedAgent.score.overall}</div>
                      <div className="text-sm text-gray-500 dark:text-slate-400">Overall Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{selectedAgent.score.performance}</div>
                      <div className="text-sm text-gray-500 dark:text-slate-400">Performance</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{selectedAgent.score.provenance}</div>
                      <div className="text-sm text-gray-500 dark:text-slate-400">Provenance</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{selectedAgent.score.perception}</div>
                      <div className="text-sm text-gray-500 dark:text-slate-400">Perception</div>
                    </div>
                  </div>
                </div>

                {/* Performance Metrics */}
                {currentMetrics && (
                  <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 md:p-6 overflow-hidden">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-slate-100">Performance Metrics</h3>
                    
                    {/* Main Metrics - Better responsive handling */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-6">
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 md:p-4 min-w-0">
                        <div className="text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400 truncate">
                          {currentMetrics.apr ? `${Number(currentMetrics.apr).toFixed(1)}%` : 'N/A'}
                        </div>
                        <div className="text-xs md:text-sm text-blue-600 dark:text-blue-400">APR</div>
                      </div>
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 md:p-4 min-w-0">
                        <div className="text-xl md:text-2xl font-bold text-green-600 dark:text-green-400 truncate">
                          {currentMetrics.ltv ? `${Number(currentMetrics.ltv).toFixed(1)}%` : 'N/A'}
                        </div>
                        <div className="text-xs md:text-sm text-green-600 dark:text-green-400">LTV</div>
                      </div>
                      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 md:p-4 min-w-0 sm:col-span-2 lg:col-span-1">
                        <div className="text-xl md:text-2xl font-bold text-purple-600 dark:text-purple-400 truncate">
                          {currentMetrics.aum ? `$${Number(currentMetrics.aum).toLocaleString(undefined, {maximumFractionDigits: 0})}` : 'N/A'}
                        </div>
                        <div className="text-xs md:text-sm text-purple-600 dark:text-purple-400">AUM</div>
                      </div>
                    </div>

                    {/* Additional Metrics - Better overflow handling */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3 mb-4 md:mb-6">
                      <div className="text-center p-2 md:p-3 bg-gray-50 dark:bg-slate-700 rounded-lg min-w-0">
                        <div className="text-base md:text-lg font-bold text-gray-700 dark:text-slate-200 truncate">
                          {currentMetrics.volatility ? `${Number(currentMetrics.volatility).toFixed(1)}%` : 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-slate-400">Volatility</div>
                      </div>
                      <div className="text-center p-2 md:p-3 bg-gray-50 dark:bg-slate-700 rounded-lg min-w-0">
                        <div className="text-base md:text-lg font-bold text-gray-700 dark:text-slate-200 truncate">
                          {currentMetrics.sharpeRatio ? Number(currentMetrics.sharpeRatio).toFixed(2) : 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-slate-400">Sharpe Ratio</div>
                      </div>
                      <div className="text-center p-2 md:p-3 bg-gray-50 dark:bg-slate-700 rounded-lg min-w-0">
                        <div className="text-base md:text-lg font-bold text-gray-700 dark:text-slate-200 truncate">
                          {currentMetrics.maxDrawdown ? `${Number(currentMetrics.maxDrawdown).toFixed(1)}%` : 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-slate-400">Max Drawdown</div>
                      </div>
                      <div className="text-center p-2 md:p-3 bg-gray-50 dark:bg-slate-700 rounded-lg min-w-0">
                        <div className="text-xs text-gray-500 dark:text-slate-400 mb-1">Last Updated</div>
                        <div className="text-xs font-medium text-gray-700 dark:text-slate-200">
                          {currentMetrics.lastUpdated ? new Date(currentMetrics.lastUpdated).toLocaleDateString() : 'N/A'}
                        </div>
                      </div>
                    </div>

                    {/* Performance Trend Chart */}
                    <div className="border-t border-gray-200 dark:border-slate-600 pt-4">
                      <h4 className="font-medium text-gray-900 dark:text-slate-100 mb-3 flex items-center justify-between">
                        <span>Performance Trend (Last 30 Days)</span>
                        <span className="text-xs text-gray-500 dark:text-slate-400">
                          {currentMetrics.apr ? `+${Number(currentMetrics.apr).toFixed(1)}%` : '0%'}
                        </span>
                      </h4>
                      <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 rounded-lg p-4 overflow-hidden">
                        {/* Simple Bar Chart */}
                        <div className="flex items-end justify-between h-32 gap-1 md:gap-2">
                          {[...Array(30)].map((_, i) => {
                            // Generate pseudo-random heights based on metrics
                            const baseHeight = 40 + (currentMetrics.apr || 0) * 2;
                            const variance = (currentMetrics.volatility || 10) / 2;
                            const randomFactor = Math.sin(i * 0.5 + (selectedAgent?.score.performance || 0)) * variance;
                            const height = Math.max(20, Math.min(100, baseHeight + randomFactor));
                            const isRecent = i >= 25;
                            
                            return (
                              <div
                                key={i}
                                className={`flex-1 rounded-t transition-all hover:opacity-80 ${
                                  isRecent 
                                    ? 'bg-gradient-to-t from-blue-500 to-purple-500' 
                                    : 'bg-gradient-to-t from-blue-400 to-purple-400 opacity-60'
                                }`}
                                style={{ height: `${height}%` }}
                                title={`Day ${i + 1}: ${height.toFixed(1)}%`}
                              />
                            );
                          })}
                        </div>
                        
                        {/* Chart Labels */}
                        <div className="flex justify-between mt-2 text-xs text-gray-600 dark:text-slate-400">
                          <span>30d ago</span>
                          <span>15d ago</span>
                          <span>Today</span>
                        </div>
                        
                        {/* Performance Indicators */}
                        <div className="grid grid-cols-3 gap-2 mt-4">
                          <div className="text-center p-2 bg-white/50 dark:bg-slate-800/50 rounded">
                            <div className="text-sm font-bold text-green-600 dark:text-green-400">
                              {currentMetrics.apr ? `+${Number(currentMetrics.apr).toFixed(1)}%` : '+0%'}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-slate-400">30D Return</div>
                          </div>
                          <div className="text-center p-2 bg-white/50 dark:bg-slate-800/50 rounded">
                            <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
                              {currentMetrics.sharpeRatio ? Number(currentMetrics.sharpeRatio).toFixed(2) : '0.00'}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-slate-400">Sharpe</div>
                          </div>
                          <div className="text-center p-2 bg-white/50 dark:bg-slate-800/50 rounded">
                            <div className="text-sm font-bold text-orange-600 dark:text-orange-400">
                              {currentMetrics.volatility ? `${Number(currentMetrics.volatility).toFixed(1)}%` : '0%'}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-slate-400">Volatility</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Reputation Summary */}
                {reputationSummary && (
                  <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 md:p-6 overflow-hidden">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-slate-100">Reputation Summary</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4">
                      <div className="text-center p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                        <div className="text-xl md:text-2xl font-bold text-gray-900 dark:text-slate-100">{reputationSummary.totalEvents}</div>
                        <div className="text-xs md:text-sm text-gray-500 dark:text-slate-400">Total Events</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="text-xl md:text-2xl font-bold text-green-600 dark:text-green-400">{reputationSummary.positiveEvents}</div>
                        <div className="text-xs md:text-sm text-gray-500 dark:text-slate-400">Positive</div>
                      </div>
                      <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <div className="text-xl md:text-2xl font-bold text-red-600 dark:text-red-400">{reputationSummary.negativeEvents}</div>
                        <div className="text-xs md:text-sm text-gray-500 dark:text-slate-400">Negative</div>
                      </div>
                      <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400">{reputationSummary.breakdown.overall}</div>
                        <div className="text-xs md:text-sm text-gray-500 dark:text-slate-400">Score</div>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Trend</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          reputationSummary.trend === 'improving' ? 'bg-green-100 text-green-800' :
                          reputationSummary.trend === 'declining' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {reputationSummary.trend}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900 dark:text-slate-100">Recent Events</h4>
                      {reputationSummary.recentEvents && reputationSummary.recentEvents.length > 0 ? (
                        reputationSummary.recentEvents.slice(0, 3).map((event) => (
                          <div key={event.id} className="flex items-start sm:items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm text-gray-900 dark:text-slate-100 truncate">{event.description}</div>
                              <div className="text-xs text-gray-500 dark:text-slate-400">
                                {new Date(event.timestamp).toLocaleDateString()}
                              </div>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 ${
                              event.impact > 0 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            }`}>
                              {event.impact > 0 ? '+' : ''}{event.impact}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 text-gray-500 dark:text-slate-400 text-sm">
                          No recent events available
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Performance Comparison */}
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 md:p-6 overflow-hidden">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-slate-100">Performance Comparison</h3>
                  <div className="overflow-x-auto -mx-4 md:mx-0">
                    <div className="inline-block min-w-full align-middle">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-600">
                        <thead className="bg-gray-50 dark:bg-slate-700">
                          <tr>
                            <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                              Agent
                            </th>
                            <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                              Score
                            </th>
                            <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider hidden sm:table-cell">
                              Performance
                            </th>
                            <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                              Tier
                            </th>
                            <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider hidden md:table-cell">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-600">
                          {agentsArray.slice(0, 5).map((agent) => (
                            <tr 
                              key={agent.id} 
                              className={`transition-colors ${agent.id === selectedAgentId ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-slate-700/50'}`}
                            >
                              <td className="px-3 md:px-6 py-4">
                                <div className="text-sm font-medium text-gray-900 dark:text-slate-100 truncate max-w-[120px] md:max-w-none">
                                  {agent.name}
                                </div>
                              </td>
                              <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-bold text-gray-900 dark:text-slate-100">{agent.score.overall}</div>
                              </td>
                              <td className="px-3 md:px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                                <div className="text-sm text-gray-900 dark:text-slate-100">{agent.score.performance}</div>
                              </td>
                              <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
                                  agent.credibilityTier === 'PLATINUM' ? 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200' :
                                  agent.credibilityTier === 'GOLD' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                  agent.credibilityTier === 'SILVER' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                                  'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                                }`}>
                                  {agent.credibilityTier}
                                </span>
                              </td>
                              <td className="px-3 md:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
                                  agent.status === 'ACTIVE' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                  agent.status === 'INACTIVE' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                                  agent.status === 'SUSPENDED' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                }`}>
                                  {agent.status.replace('_', ' ')}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  {agentsArray.length === 0 && (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-3">🤖</div>
                      <p className="text-gray-500 dark:text-slate-400">No agents found</p>
                      <p className="text-sm text-gray-400 dark:text-slate-500 mt-1">
                        Check console for API errors
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-8 md:p-12 text-center">
                <div className="text-6xl mb-4">🤖</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-2">
                  No Agent Selected
                </h3>
                <p className="text-gray-500 dark:text-slate-400 mb-4">
                  Select an agent from the list to view performance metrics and reputation data
                </p>
                {agentsArray.length === 0 && (
                  <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <p className="text-sm text-yellow-800 dark:text-yellow-400">
                      No agents available. Loading data...
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
