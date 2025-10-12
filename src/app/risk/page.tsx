'use client';

import { useState, useEffect, useCallback } from 'react';
import { Agent } from '@/types/agent';
import { RiskMetrics } from '@/types/credit';
import { Header } from '@/components/Header';

export default function RiskPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [riskMetrics, setRiskMetrics] = useState<RiskMetrics | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const fetchAgents = useCallback(async () => {
    try {
      const response = await fetch('/api/agents');
      const result = await response.json();
      const data = result.success ? result.data : result;
      const agentsArray = Array.isArray(data) ? data : [];
      setAgents(agentsArray);
      if (agentsArray.length > 0 && !selectedAgentId) {
        setSelectedAgentId(agentsArray[0].id);
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
      setAgents([]);
    }
  }, [selectedAgentId]);

  useEffect(() => {
    setIsMounted(true);
    fetchAgents();
  }, [fetchAgents]);

  useEffect(() => {
    if (selectedAgentId) {
      fetchRiskMetrics(selectedAgentId);
    }
  }, [selectedAgentId]);

  const fetchRiskMetrics = async (agentId: string) => {
    try {
      const response = await fetch(`/api/risk?agentId=${agentId}`);
      if (response.ok) {
        const result = await response.json();
        const data = result.success ? result.data : result;
        setRiskMetrics(data);
      } else {
        console.error('Failed to fetch risk metrics', response.status);
        setRiskMetrics(null);
      }
    } catch (error) {
      console.error('Error fetching risk metrics:', error);
      setRiskMetrics(null);
    }
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Risk Monitor: Agent Performance & Risk Assessment</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-16 bg-gray-100 dark:bg-gray-700 rounded"></div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="lg:col-span-2">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-20 bg-gray-100 dark:bg-gray-700 rounded"></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const selectedAgent = Array.isArray(agents) ? agents.find(a => a.id === selectedAgentId) : undefined;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900" suppressHydrationWarning>
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold" style={{ color: '#0f172a' }}>Risk Monitor: Agent Performance & Risk Assessment</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Monitor agent performance metrics and risk assessment data
          </p>
        </div>
      
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6 overflow-hidden sticky top-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Select Agent</h2>
              {Array.isArray(agents) && agents.length > 0 ? (
                <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
                  {agents.map((agent) => (
                    <button
                      key={agent.id}
                      onClick={() => setSelectedAgentId(agent.id)}
                      className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
                        selectedAgentId === agent.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400 shadow-md'
                          : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <div className="font-medium text-gray-900 dark:text-white truncate flex-1">{agent.name}</div>
                        <span className={`ml-2 px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 ${
                          agent.credibilityTier === 'PLATINUM' ? 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200' :
                          agent.credibilityTier === 'GOLD' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          agent.credibilityTier === 'SILVER' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                          'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                        }`}>
                          {agent.credibilityTier}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 truncate mb-1">{agent.metadata.description}</div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-500">Score: {agent.score.overall}</span>
                        <span className={`px-1.5 py-0.5 rounded ${
                          agent.status === 'ACTIVE' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {agent.status}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-sm text-gray-500 dark:text-slate-400">Loading agents...</p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            {selectedAgent && riskMetrics ? (
              <div className="space-y-6">
                {/* Risk Overview - Top Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border-l-4 border-blue-500">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Overall Score</div>
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{selectedAgent.score.overall}</div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border-l-4 border-green-500">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Performance</div>
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">{selectedAgent.score.performance}</div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border-l-4 border-purple-500">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Health Factor</div>
                    <div className={`text-3xl font-bold ${
                      riskMetrics.healthFactor >= 1.5 ? 'text-green-600 dark:text-green-400' :
                      riskMetrics.healthFactor >= 1.2 ? 'text-yellow-600 dark:text-yellow-400' :
                      'text-red-600 dark:text-red-400'
                    }`}>
                      {riskMetrics.healthFactor.toFixed(2)}
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border-l-4 border-orange-500">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Risk Level</div>
                    <div className={`text-2xl font-bold ${
                      riskMetrics.healthFactor >= 1.5 ? 'text-green-600 dark:text-green-400' :
                      riskMetrics.healthFactor >= 1.2 ? 'text-yellow-600 dark:text-yellow-400' :
                      'text-red-600 dark:text-red-400'
                    }`}>
                      {riskMetrics.healthFactor >= 1.5 ? 'Low' :
                       riskMetrics.healthFactor >= 1.2 ? 'Medium' : 'High'}
                    </div>
                  </div>
                </div>

                {/* Agent Overview */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 overflow-hidden">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Agent: {selectedAgent.name}
                  </h2>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{selectedAgent.score.overall}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Overall</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">{selectedAgent.score.performance}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Performance</div>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{selectedAgent.score.provenance}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Provenance</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{selectedAgent.score.perception}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Perception</div>
                    </div>
                  </div>
                </div>

                {/* Health Factor Visual */}
                {riskMetrics.healthFactor && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 overflow-hidden">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Health Factor Overview</h3>
                    
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Health Factor</span>
                        <span className={`text-2xl font-bold ${
                          riskMetrics.healthFactor >= 1.5 ? 'text-green-600 dark:text-green-400' :
                          riskMetrics.healthFactor >= 1.2 ? 'text-yellow-600 dark:text-yellow-400' :
                          'text-red-600 dark:text-red-400'
                        }`}>
                          {riskMetrics.healthFactor === Infinity ? '∞' : riskMetrics.healthFactor.toFixed(2)}
                        </span>
                      </div>
                      
                      {/* Health Factor Progress Bar */}
                      {riskMetrics.healthFactor !== Infinity && (
                        <div className="relative">
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                            <div 
                              className={`h-4 rounded-full transition-all duration-500 ${
                                riskMetrics.healthFactor >= 1.5 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                                riskMetrics.healthFactor >= 1.2 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                                'bg-gradient-to-r from-red-400 to-red-600'
                              }`}
                              style={{ width: `${Math.min(100, (riskMetrics.healthFactor / 2) * 100)}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                            <span>Critical (1.0)</span>
                            <span>Warning (1.2)</span>
                            <span>Safe (1.5)</span>
                            <span>Excellent (2.0+)</span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3">
                      <div className={`p-3 rounded-lg text-center ${
                        riskMetrics.healthFactor >= 1.5 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-slate-700'
                      }`}>
                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Safe Zone</div>
                        <div className={`font-bold ${riskMetrics.healthFactor >= 1.5 ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
                          ≥ 1.5
                        </div>
                      </div>
                      <div className={`p-3 rounded-lg text-center ${
                        riskMetrics.healthFactor >= 1.2 && riskMetrics.healthFactor < 1.5 ? 'bg-yellow-50 dark:bg-yellow-900/20' : 'bg-gray-50 dark:bg-slate-700'
                      }`}>
                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Warning</div>
                        <div className={`font-bold ${riskMetrics.healthFactor >= 1.2 && riskMetrics.healthFactor < 1.5 ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-400'}`}>
                          1.2-1.5
                        </div>
                      </div>
                      <div className={`p-3 rounded-lg text-center ${
                        riskMetrics.healthFactor < 1.2 ? 'bg-red-50 dark:bg-red-900/20' : 'bg-gray-50 dark:bg-slate-700'
                      }`}>
                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Critical</div>
                        <div className={`font-bold ${riskMetrics.healthFactor < 1.2 ? 'text-red-600 dark:text-red-400' : 'text-gray-400'}`}>
                          &lt; 1.2
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {riskMetrics.ltv && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 overflow-hidden">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">LTV & Credit Analysis</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-3">Current LTV Status</h4>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between mb-2">
                              <span className="text-gray-600 dark:text-gray-400">Current LTV:</span>
                              <span className="font-medium text-gray-900 dark:text-white">{riskMetrics.ltv?.current ?? 0}%</span>
                            </div>
                            {/* LTV Progress Bar */}
                            <div className="relative">
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                                <div 
                                  className={`h-3 rounded-full transition-all duration-500 ${
                                    (riskMetrics.ltv?.current ?? 0) > (riskMetrics.ltv?.maximum ?? 100) * 0.8 
                                      ? 'bg-gradient-to-r from-red-400 to-red-600' 
                                      : (riskMetrics.ltv?.current ?? 0) > (riskMetrics.ltv?.maximum ?? 100) * 0.6
                                      ? 'bg-gradient-to-r from-yellow-400 to-yellow-600'
                                      : 'bg-gradient-to-r from-green-400 to-green-600'
                                  }`}
                                  style={{ width: `${((riskMetrics.ltv?.current ?? 0) / (riskMetrics.ltv?.maximum ?? 100)) * 100}%` }}
                                />
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Maximum LTV:</span>
                            <span className="font-medium text-gray-900 dark:text-white">{riskMetrics.ltv?.maximum ?? 0}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">LTV Utilization:</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {riskMetrics.ltv?.maximum ? ((riskMetrics.ltv.current / riskMetrics.ltv.maximum) * 100).toFixed(1) : 0}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Risk Level:</span>
                            <span className={`font-medium px-2 py-1 rounded text-xs ${
                              (riskMetrics.ltv?.current ?? 0) > (riskMetrics.ltv?.maximum ?? 100) * 0.8 
                                ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400' 
                                : (riskMetrics.ltv?.current ?? 0) > (riskMetrics.ltv?.maximum ?? 100) * 0.6
                                ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400'
                                : 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400'
                            }`}>
                              {(riskMetrics.ltv?.current ?? 0) > (riskMetrics.ltv?.maximum ?? 100) * 0.8 
                                ? 'High' 
                                : (riskMetrics.ltv?.current ?? 0) > (riskMetrics.ltv?.maximum ?? 100) * 0.6
                                ? 'Medium'
                                : 'Low'
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                    
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-3">Credit Line Details</h4>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between mb-2">
                              <span className="text-gray-600 dark:text-gray-400">Available Credit:</span>
                              <span className="font-medium text-green-600 dark:text-green-400">${(riskMetrics.creditLine?.available ?? 0).toLocaleString()}</span>
                            </div>
                            {/* Credit Usage Progress Bar */}
                            <div className="relative">
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                                <div 
                                  className="h-3 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-500"
                                  style={{ width: `${((riskMetrics.creditLine?.used ?? 0) / (riskMetrics.creditLine?.total ?? 1)) * 100}%` }}
                                />
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Used Credit:</span>
                            <span className="font-medium text-gray-900 dark:text-white">${(riskMetrics.creditLine?.used ?? 0).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Total Credit:</span>
                            <span className="font-medium text-gray-900 dark:text-white">${(riskMetrics.creditLine?.total ?? 0).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">APR Rate:</span>
                            <span className="font-medium text-gray-900 dark:text-white">{riskMetrics.creditLine?.apr ?? 0}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Collateral Information */}
                {riskMetrics.collateral && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 overflow-hidden">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Collateral Management</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-3">Collateral Values</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Total Collateral:</span>
                            <span className="font-medium text-gray-900 dark:text-white">${(riskMetrics.collateral?.totalValue ?? 0).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Required Collateral:</span>
                            <span className="font-medium text-gray-900 dark:text-white">${(riskMetrics.collateral?.requiredValue ?? 0).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Excess Collateral:</span>
                            <span className="font-medium text-green-600 dark:text-green-400">${(riskMetrics.collateral?.excessCollateral ?? 0).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-3">Collateral Ratio</h4>
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Current Ratio</span>
                            <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                              {(riskMetrics.collateral?.collateralRatio ?? 0).toFixed(0)}%
                            </span>
                          </div>
                          {/* Collateral Ratio Progress Bar */}
                          <div className="relative">
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                              <div 
                                className="h-3 rounded-full bg-gradient-to-r from-purple-400 to-purple-600 transition-all duration-500"
                                style={{ width: `${Math.min(100, (riskMetrics.collateral?.collateralRatio ?? 0) / 2)}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                              <span>Min (150%)</span>
                              <span>Safe (200%+)</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className={`p-3 rounded-lg text-center ${
                          (riskMetrics.collateral?.collateralRatio ?? 0) >= 200 
                            ? 'bg-green-50 dark:bg-green-900/20' 
                            : (riskMetrics.collateral?.collateralRatio ?? 0) >= 150
                            ? 'bg-yellow-50 dark:bg-yellow-900/20'
                            : 'bg-red-50 dark:bg-red-900/20'
                        }`}>
                          <div className={`text-sm font-bold ${
                            (riskMetrics.collateral?.collateralRatio ?? 0) >= 200 
                              ? 'text-green-600 dark:text-green-400' 
                              : (riskMetrics.collateral?.collateralRatio ?? 0) >= 150
                              ? 'text-yellow-600 dark:text-yellow-400'
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            {(riskMetrics.collateral?.collateralRatio ?? 0) >= 200 
                              ? '✓ Well Collateralized' 
                              : (riskMetrics.collateral?.collateralRatio ?? 0) >= 150
                              ? '⚠ Adequately Collateralized'
                              : '✗ Under-collateralized'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {riskMetrics.assetManagement && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 overflow-hidden">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Asset Management & Performance</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-3">Asset Metrics</h4>
                        <div className="space-y-4">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Assets Under Management:</span>
                            <span className="font-medium text-gray-900 dark:text-white">${(riskMetrics.assetManagement?.aum ?? 0).toLocaleString()}</span>
                          </div>
                          
                          <div>
                            <div className="flex justify-between mb-2">
                              <span className="text-gray-600 dark:text-gray-400">Asset Diversity Score:</span>
                              <span className="font-medium text-gray-900 dark:text-white">{riskMetrics.assetManagement?.diversityScore ?? 0}/100</span>
                            </div>
                            {/* Diversity Score Progress Bar */}
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div 
                                className="h-2 rounded-full bg-gradient-to-r from-blue-400 to-green-600 transition-all duration-500"
                                style={{ width: `${riskMetrics.assetManagement?.diversityScore ?? 0}%` }}
                              />
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex justify-between mb-2">
                              <span className="text-gray-600 dark:text-gray-400">Liquidation Risk:</span>
                              <span className={`font-medium px-2 py-1 rounded text-xs ${
                                (riskMetrics.assetManagement?.liquidationRisk ?? 0) > 70 
                                  ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400' 
                                  : (riskMetrics.assetManagement?.liquidationRisk ?? 0) > 40
                                  ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400'
                                  : 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400'
                              }`}>
                                {(riskMetrics.assetManagement?.liquidationRisk ?? 0).toFixed(1)}% Risk
                              </span>
                            </div>
                            {/* Liquidation Risk Progress Bar (inverted - lower is better) */}
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-500 ${
                                  (riskMetrics.assetManagement?.liquidationRisk ?? 0) > 70 
                                    ? 'bg-gradient-to-r from-red-500 to-red-600' 
                                    : (riskMetrics.assetManagement?.liquidationRisk ?? 0) > 40
                                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                                    : 'bg-gradient-to-r from-green-400 to-green-600'
                                }`}
                                style={{ width: `${riskMetrics.assetManagement?.liquidationRisk ?? 0}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-3">Performance & Stability</h4>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between mb-2">
                              <span className="text-gray-600 dark:text-gray-400">Performance Variance:</span>
                              <span className="font-medium text-gray-900 dark:text-white">{riskMetrics.performanceVariance ?? 0}%</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div 
                                className="h-2 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all duration-500"
                                style={{ width: `${Math.min(100, riskMetrics.performanceVariance ?? 0)}%` }}
                              />
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex justify-between mb-2">
                              <span className="text-gray-600 dark:text-gray-400">Tier Stability:</span>
                              <span className="font-medium text-gray-900 dark:text-white">{riskMetrics.tierStability ?? 0}/100</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div 
                                className="h-2 rounded-full bg-gradient-to-r from-blue-400 to-purple-600 transition-all duration-500"
                                style={{ width: `${riskMetrics.tierStability ?? 0}%` }}
                              />
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex justify-between mb-2">
                              <span className="text-gray-600 dark:text-gray-400">Market Exposure:</span>
                              <span className="font-medium text-gray-900 dark:text-white">{riskMetrics.marketExposure ?? 0}%</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div 
                                className="h-2 rounded-full bg-gradient-to-r from-indigo-400 to-indigo-600 transition-all duration-500"
                                style={{ width: `${riskMetrics.marketExposure ?? 0}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Risk Alerts & Recommendations</h3>
                  
                  <div className="space-y-3">
                    {(riskMetrics.ltv?.current ?? 0) > (riskMetrics.ltv?.maximum ?? 100) * 0.8 && (
                      <div className="p-3 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-400 rounded">
                        <div className="font-medium text-red-800 dark:text-red-400">High LTV Alert</div>
                        <div className="text-sm text-red-600 dark:text-red-300">
                          Current LTV ({riskMetrics.ltv?.current ?? 0}%) is approaching maximum ({riskMetrics.ltv?.maximum ?? 100}%). 
                          Consider reducing exposure or increasing collateral.
                        </div>
                      </div>
                    )}
                    
                    {(riskMetrics.assetManagement?.liquidationRisk ?? 0) > 70 && (
                      <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 dark:border-orange-400 rounded">
                        <div className="font-medium text-orange-800 dark:text-orange-400">Liquidation Risk Warning</div>
                        <div className="text-sm text-orange-600 dark:text-orange-300">
                          Liquidation risk is high ({riskMetrics.assetManagement?.liquidationRisk ?? 0}%). 
                          Monitor market conditions closely.
                        </div>
                      </div>
                    )}
                    
                    {(riskMetrics.performanceVariance ?? 0) > 20 && (
                      <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 dark:border-yellow-400 rounded">
                        <div className="font-medium text-yellow-800 dark:text-yellow-400">Performance Variance Alert</div>
                        <div className="text-sm text-yellow-600 dark:text-yellow-300">
                          High performance variance ({riskMetrics.performanceVariance ?? 0}%) detected. 
                          Review strategy consistency.
                        </div>
                      </div>
                    )}
                    
                    {!((riskMetrics.ltv?.current ?? 0) > (riskMetrics.ltv?.maximum ?? 100) * 0.8) && 
                     !((riskMetrics.assetManagement?.liquidationRisk ?? 0) > 70) && 
                     !((riskMetrics.performanceVariance ?? 0) > 20) && (
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 dark:border-green-400 rounded">
                        <div className="font-medium text-green-800 dark:text-green-400">All Systems Normal</div>
                        <div className="text-sm text-green-600 dark:text-green-300">
                          No immediate risk alerts. Agent performance is within acceptable parameters.
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 md:p-12 text-center">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-2">
                  No Agent Selected
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Select an agent from the list to view detailed risk metrics, health factors, and performance data
                </p>
                {Array.isArray(agents) && agents.length === 0 && (
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