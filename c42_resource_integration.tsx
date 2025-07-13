import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, BarChart3, TrendingUp, Users, Target, Zap, Eye, Settings, ArrowRight, Brain, Shield } from 'lucide-react';

// Mock SDK for demo purposes
const createMockSDK = () => {
  const eventBus = {
    listeners: new Map(),
    emit: (event, data) => {
      const handlers = eventBus.listeners.get(event) || [];
      handlers.forEach(handler => handler(data));
    },
    on: (event, handler) => {
      if (!eventBus.listeners.has(event)) {
        eventBus.listeners.set(event, []);
      }
      eventBus.listeners.get(event).push(handler);
    }
  };

  return {
    version: '3.0',
    agent: {
      register: (id, capabilities) => {
        console.log(`🤖 Agent registered: ${id}`, capabilities);
        eventBus.emit('agent_registered', { id, capabilities });
      },
      broadcast: async (message) => {
        console.log('📢 Broadcasting:', message);
        eventBus.emit('agent_message', message);
        eventBus.emit(`message_${message.topic}`, message);
      },
      whisper: async (to, content) => {
        console.log(`🤫 Whispering to ${to}:`, content);
        eventBus.emit('agent_whisper', { to, content });
      },
      convene: async (topic) => {
        const councilId = `council_${Date.now()}`;
        console.log(`🏛️ Council convened: ${councilId} for ${topic}`);
        eventBus.emit('council_convened', { councilId, topic });
        return councilId;
      },
      subscribe: (pattern, handler) => {
        eventBus.on(`message_${pattern}`, handler);
        eventBus.on('agent_message', (msg) => {
          if (pattern === '*' || msg.topic.includes(pattern)) {
            handler(msg);
          }
        });
      }
    },
    eventBus
  };
};

// Council-Enhanced ResourceDistributorAgent
class DemoResourceDistributorAgent {
  constructor(sdk) {
    this.id = 'Distributor-Agent';
    this.sdk = sdk;
    this.donors = new Map();
    this.causes = new Map();
    this.allocationHistory = [];
    this.isProcessing = false;
    this.councilActive = false;
    this.councilInsights = [];
    
    this.initialize();
  }

  async initialize() {
    this.sdk.agent.register(this.id, ['allocate_resources', 'track_flows', 'coordinate_donors', 'council_review']);
    
    this.sdk.agent.subscribe('offer_capacity', (msg) => this.handleCapacityOffer(msg));
    this.sdk.agent.subscribe('register_need', (msg) => this.handleNeedRegistration(msg));
    this.sdk.agent.subscribe('preference_update', (msg) => this.handlePreferenceUpdate(msg));
    this.sdk.agent.subscribe('council_insight', (msg) => this.handleCouncilInsight(msg));
    
    await this.sdk.agent.broadcast({
      from: this.id,
      topic: 'agent:ready',
      content: { message: 'ResourceDistributorAgent ready!' }
    });
  }

  async handleCapacityOffer(msg) {
    const { donorId, wallet, allocationPercentage = 0.15, preferences = {} } = msg.content;
    
    const donor = {
      id: donorId,
      wallet,
      preferences,
      allocationBudget: wallet * allocationPercentage,
      lastActivity: Date.now(),
      trustLevel: 75
    };
    
    this.donors.set(donorId, donor);
    console.log(`💰 Donor ${donorId} offered ${donor.allocationBudget} tokens`);
    
    await this.evaluateAllocations();
    
    await this.sdk.agent.whisper(donorId, {
      topic: 'capacity_acknowledged',
      content: { budget: donor.allocationBudget, message: 'Capacity registered successfully' }
    });
  }

  async handleNeedRegistration(msg) {
    const { causeId, name, need, priority = 0.6 } = msg.content;
    
    const cause = {
      id: causeId,
      name: name || causeId,
      need,
      priority: Math.max(0, Math.min(1, priority)),
      received: 0,
      totalReceived: 0,
      lastUpdate: Date.now()
    };
    
    this.causes.set(causeId, cause);
    console.log(`🎯 Cause ${causeId} needs ${need} tokens (priority: ${priority})`);
    
    await this.evaluateAllocations();
    
    await this.sdk.agent.whisper(causeId, {
      topic: 'need_acknowledged',
      content: { need, priority, message: 'Need registered successfully' }
    });
  }

  async handlePreferenceUpdate(msg) {
    const { donorId, preferences } = msg.content;
    const donor = this.donors.get(donorId);
    if (donor) {
      donor.preferences = { ...donor.preferences, ...preferences };
      await this.evaluateAllocations();
    }
  }

  async handleCouncilInsight(msg) {
    if (!this.councilActive) return;
    
    console.log(`🏛️ Council insight received from ${msg.from}:`, msg.content);
    this.councilInsights.push(msg.content);
    
    if (this.councilInsights.length >= 3) {
      const allocations = this.calculateAllocations();
      const synthesized = this.synthesizeCouncilDecision(allocations, this.councilInsights);
      await this.executeAllocations(synthesized);
      
      this.councilActive = false;
      this.councilInsights = [];
    }
  }

  async evaluateAllocations() {
    if (this.isProcessing || this.donors.size === 0 || this.causes.size === 0) return;
    
    this.isProcessing = true;
    
    try {
      const allocations = this.calculateAllocations();
      const confidence = this.calculateConfidence(allocations);
      
      if (confidence < 0.7 || this.detectMajorReallocation(allocations)) {
        await this.conveneCouncil(allocations, confidence);
      } else {
        await this.executeAllocations(allocations);
      }
    } finally {
      this.isProcessing = false;
    }
  }

  calculateAllocations() {
    const allocations = {};
    
    this.donors.forEach((donor, donorId) => {
      if (donor.allocationBudget <= 0) return;
      
      allocations[donorId] = {};
      
      const relevantCauses = Array.from(this.causes.values()).filter(cause => 
        donor.preferences[cause.id] && donor.preferences[cause.id] > 0
      );
      
      if (relevantCauses.length === 0) return;
      
      const totalWeightedPriority = relevantCauses.reduce((sum, cause) => {
        const preferenceWeight = donor.preferences[cause.id] || 0;
        const priorityWeight = cause.priority;
        const needWeight = Math.min(cause.need, donor.allocationBudget);
        return sum + (preferenceWeight * priorityWeight * needWeight);
      }, 0);
      
      if (totalWeightedPriority <= 0) return;
      
      relevantCauses.forEach(cause => {
        const preferenceWeight = donor.preferences[cause.id] || 0;
        const priorityWeight = cause.priority;
        const needWeight = Math.min(cause.need, donor.allocationBudget);
        
        const weightedScore = preferenceWeight * priorityWeight * needWeight;
        const proportion = weightedScore / totalWeightedPriority;
        
        let allocation = donor.allocationBudget * proportion;
        allocation = Math.min(allocation, cause.need - cause.received);
        
        if (allocation > 0) {
          allocations[donorId][cause.id] = allocation;
        }
      });
    });
    
    return allocations;
  }

  calculateConfidence(allocations) {
    let totalNeed = 0;
    let totalMet = 0;
    
    this.causes.forEach(cause => {
      totalNeed += cause.need;
      
      const causeReceived = Object.values(allocations).reduce((sum, donorAllocations) => {
        return sum + (donorAllocations[cause.id] || 0);
      }, 0);
      
      totalMet += Math.min(causeReceived, cause.need);
    });
    
    return totalNeed > 0 ? totalMet / totalNeed : 1.0;
  }

  detectMajorReallocation(allocations) {
    const totalAllocation = Object.values(allocations).reduce((sum, donorAllocations) => {
      return sum + Object.values(donorAllocations).reduce((s, amount) => s + amount, 0);
    }, 0);
    
    return Object.values(allocations).some(donorAllocations =>
      Object.values(donorAllocations).some(amount => amount > totalAllocation * 0.3)
    );
  }

  async conveneCouncil(allocations, confidence) {
    console.log(`🏛️ Convening council - confidence: ${confidence.toFixed(2)}`);
    
    this.councilActive = true;
    this.councilInsights = [];
    
    const councilId = await this.sdk.agent.convene('resource_allocation_review');
    
    await this.sdk.agent.broadcast({
      from: this.id,
      topic: 'council:resource_context',
      content: {
        councilId,
        proposed: allocations,
        confidence,
        donors: Array.from(this.donors.values()),
        causes: Array.from(this.causes.values()),
        question: 'Should we proceed with these allocations or modify the approach?'
      }
    });
    
    setTimeout(() => this.triggerSpecialistAgents(allocations), 1000);
  }

  async triggerSpecialistAgents(allocations) {
    const ethicsInsight = this.generateEthicsInsight(allocations);
    const impactInsight = this.generateImpactInsight(allocations);
    const communityInsight = this.generateCommunityInsight(allocations);
    
    setTimeout(() => this.sdk.agent.broadcast({
      from: 'Ethics-Agent',
      topic: 'council_insight',
      content: ethicsInsight
    }), 500);
    
    setTimeout(() => this.sdk.agent.broadcast({
      from: 'Impact-Agent', 
      topic: 'council_insight',
      content: impactInsight
    }), 1000);
    
    setTimeout(() => this.sdk.agent.broadcast({
      from: 'Community-Agent',
      topic: 'council_insight',
      content: communityInsight
    }), 1500);
  }

  generateEthicsInsight(allocations) {
    const insight = {
      agent: 'Ethics-Agent',
      reasoning: 'Analyzing allocation fairness and equity impact',
      recommendations: {},
      confidence: 0.85
    };
    
    Object.keys(allocations).forEach(donorId => {
      insight.recommendations[donorId] = {};
      Object.keys(allocations[donorId]).forEach(causeId => {
        const original = allocations[donorId][causeId];
        const adjustment = causeId.includes('climate') || causeId.includes('education') ? 1.1 : 0.95;
        insight.recommendations[donorId][causeId] = original * adjustment;
      });
    });
    
    return insight;
  }

  generateImpactInsight(allocations) {
    const insight = {
      agent: 'Impact-Agent',
      reasoning: 'Optimizing for measurable impact per dollar',
      recommendations: {},
      confidence: 0.90
    };
    
    Object.keys(allocations).forEach(donorId => {
      insight.recommendations[donorId] = {};
      Object.keys(allocations[donorId]).forEach(causeId => {
        const original = allocations[donorId][causeId];
        const multiplier = causeId.includes('journalism') ? 1.15 : causeId.includes('education') ? 1.05 : 1.0;
        insight.recommendations[donorId][causeId] = original * multiplier;
      });
    });
    
    return insight;
  }

  generateCommunityInsight(allocations) {
    const insight = {
      agent: 'Community-Agent',
      reasoning: 'Reflecting community sentiment and engagement levels',
      recommendations: {},
      confidence: 0.80
    };
    
    Object.keys(allocations).forEach(donorId => {
      insight.recommendations[donorId] = {};
      Object.keys(allocations[donorId]).forEach(causeId => {
        const original = allocations[donorId][causeId];
        const adjustment = 0.98 + (Math.random() * 0.04);
        insight.recommendations[donorId][causeId] = original * adjustment;
      });
    });
    
    return insight;
  }

  synthesizeCouncilDecision(proposed, insights) {
    console.log('🧠 Synthesizing council decision with', insights.length, 'insights');
    
    const synthesized = {};
    
    Object.keys(proposed).forEach(donorId => {
      synthesized[donorId] = {};
      Object.keys(proposed[donorId]).forEach(causeId => {
        const originalAmount = proposed[donorId][causeId];
        
        const recommendations = insights
          .filter(insight => insight.recommendations[donorId] && insight.recommendations[donorId][causeId])
          .map(insight => insight.recommendations[donorId][causeId]);
        
        if (recommendations.length > 0) {
          const avgRecommendation = recommendations.reduce((sum, rec) => sum + rec, 0) / recommendations.length;
          synthesized[donorId][causeId] = (avgRecommendation * 0.7) + (originalAmount * 0.3);
        } else {
          synthesized[donorId][causeId] = originalAmount;
        }
      });
    });
    
    return synthesized;
  }

  async executeAllocations(allocations) {
    const executedAllocations = [];
    
    for (const [donorId, donorAllocations] of Object.entries(allocations)) {
      const donor = this.donors.get(donorId);
      if (!donor) continue;
      
      for (const [causeId, amount] of Object.entries(donorAllocations)) {
        const cause = this.causes.get(causeId);
        if (!cause || amount <= 0) continue;
        
        donor.wallet -= amount;
        donor.allocationBudget -= amount;
        cause.received += amount;
        cause.totalReceived += amount;
        
        const event = {
          timestamp: Date.now(),
          donorId,
          causeId,
          amount,
          confidence: this.calculateConfidence(allocations),
          reasoning: this.councilActive ? 'Council-synthesized allocation' : 'Allocated based on preference and priority',
          councilSynthesized: this.councilActive
        };
        
        executedAllocations.push(event);
        this.allocationHistory.push(event);
        
        await this.sdk.agent.whisper(donorId, {
          topic: 'allocation_executed',
          content: {
            causeId,
            causeName: cause.name,
            amount,
            remainingWallet: donor.wallet,
            councilReviewed: this.councilActive
          }
        });
        
        await this.sdk.agent.whisper(causeId, {
          topic: 'funding_received',
          content: {
            donorId,
            amount,
            totalReceived: cause.totalReceived,
            needRemaining: Math.max(0, cause.need - cause.received)
          }
        });
      }
    }
    
    this.causes.forEach(cause => {
      cause.received = 0;
    });
    
    await this.sdk.agent.broadcast({
      from: this.id,
      topic: 'allocation_summary',
      content: {
        totalAllocated: executedAllocations.reduce((sum, event) => sum + event.amount, 0),
        allocationCount: executedAllocations.length,
        donorsParticipated: new Set(executedAllocations.map(e => e.donorId)).size,
        causesSupported: new Set(executedAllocations.map(e => e.causeId)).size,
        councilReviewed: this.councilActive,
        timestamp: Date.now()
      }
    });
  }

  getDashboardData() {
    return {
      activeDonors: this.donors.size,
      activeCauses: this.causes.size,
      totalAllocated: this.allocationHistory.reduce((sum, e) => sum + e.amount, 0),
      recentAllocations: this.allocationHistory.slice(-5),
      allocationHistory: this.allocationHistory,
      donors: Array.from(this.donors.values()),
      causes: Array.from(this.causes.values()),
      councilActive: this.councilActive,
      councilInsights: this.councilInsights
    };
  }
}

// Main Integration Component
const C42ResourceDistributorDemo = () => {
  const [sdk, setSdk] = useState(null);
  const [distributor, setDistributor] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [recentMessages, setRecentMessages] = useState([]);
  const [isAutoMode, setIsAutoMode] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [councilData, setCouncilData] = useState(null);
  const autoModeRef = useRef(null);

  useEffect(() => {
    const mockSDK = createMockSDK();
    setSdk(mockSDK);
    
    const agent = new DemoResourceDistributorAgent(mockSDK);
    setDistributor(agent);
    
    mockSDK.eventBus.on('agent_message', (msg) => {
      setRecentMessages(prev => [...prev.slice(-4), {
        id: Date.now(),
        from: msg.from,
        topic: msg.topic,
        timestamp: new Date().toLocaleTimeString()
      }]);
      
      if (msg.topic === 'council:resource_context') {
        setCouncilData(msg.content);
      }
    });
    
    mockSDK.eventBus.on('agent_whisper', (whisper) => {
      setRecentMessages(prev => [...prev.slice(-4), {
        id: Date.now(),
        from: 'System',
        topic: `whisper → ${whisper.to}`,
        timestamp: new Date().toLocaleTimeString()
      }]);
    });
    
    mockSDK.eventBus.on('council_convened', (council) => {
      setRecentMessages(prev => [...prev.slice(-4), {
        id: Date.now(),
        from: 'System',
        topic: `Council: ${council.topic}`,
        timestamp: new Date().toLocaleTimeString()
      }]);
    });
    
    const interval = setInterval(() => {
      if (agent) {
        setDashboardData(agent.getDashboardData());
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const sendMockDonor = async (donorData) => {
    if (!sdk) return;
    
    await sdk.agent.broadcast({
      from: donorData.id,
      topic: 'offer_capacity',
      content: {
        donorId: donorData.id,
        wallet: donorData.wallet,
        allocationPercentage: donorData.percentage,
        preferences: donorData.preferences
      }
    });
  };

  const sendMockCause = async (causeData) => {
    if (!sdk) return;
    
    await sdk.agent.broadcast({
      from: causeData.id,
      topic: 'register_need',
      content: {
        causeId: causeData.id,
        name: causeData.name,
        need: causeData.need,
        priority: causeData.priority
      }
    });
  };

  const startAutoMode = () => {
    if (isAutoMode) {
      clearInterval(autoModeRef.current);
      setIsAutoMode(false);
      return;
    }
    
    setIsAutoMode(true);
    
    const scenarios = [
      () => sendMockDonor({
        id: 'alice',
        wallet: 150,
        percentage: 0.2,
        preferences: { 'climate-fund': 0.8, 'journalism-fund': 0.3, 'education-fund': 0.5 }
      }),
      () => sendMockCause({
        id: 'climate-fund',
        name: 'Climate Justice Fund',
        need: 45,
        priority: 0.9
      }),
      () => sendMockDonor({
        id: 'bob',
        wallet: 100,
        percentage: 0.15,
        preferences: { 'journalism-fund': 0.7, 'education-fund': 0.6, 'climate-fund': 0.4 }
      }),
      () => sendMockCause({
        id: 'journalism-fund',
        name: 'Independent Journalism',
        need: 35,
        priority: 0.7
      }),
      () => sendMockCause({
        id: 'education-fund',
        name: 'Digital Education Access',
        need: 25,
        priority: 0.6
      }),
      () => sendMockDonor({
        id: 'charlie',
        wallet: 75,
        percentage: 0.25,
        preferences: { 'education-fund': 0.9, 'climate-fund': 0.6 }
      })
    ];
    
    let scenarioIndex = 0;
    autoModeRef.current = setInterval(() => {
      scenarios[scenarioIndex % scenarios.length]();
      scenarioIndex++;
    }, 3000);
  };

  // Council Modal Component
  const CouncilModal = ({ isOpen, data, onClose }) => {
    const [insights, setInsights] = useState([]);
    
    useEffect(() => {
      if (isOpen && data) {
        setInsights([]);
        
        const handleInsight = (msg) => {
          if (msg.topic === 'council_insight') {
            setInsights(prev => [...prev, msg.content]);
          }
        };
        
        if (sdk) {
          sdk.eventBus.on('agent_message', handleInsight);
          return () => {
            // Note: In a real implementation, you'd want proper cleanup
          };
        }
      }
    }, [isOpen, data, sdk]);
    
    if (!isOpen || !data) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-c42-dark-card rounded-xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-c42-text-dark-primary">
              🏛️ Council Review: Resource Allocation
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Context Panel */}
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-c42-text-dark-primary mb-2">Allocation Context</h4>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-sm">
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium">Confidence:</span> {(data.confidence * 100).toFixed(1)}%
                    </div>
                    <div>
                      <span className="font-medium">Donors:</span> {data.donors?.length || 0}
                    </div>
                    <div>
                      <span className="font-medium">Causes:</span> {data.causes?.length || 0}
                    </div>
                    <div>
                      <span className="font-medium">Question:</span> {data.question}
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 dark:text-c42-text-dark-primary mb-2">Proposed Allocations</h4>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-sm max-h-40 overflow-y-auto">
                  {data.proposed && Object.entries(data.proposed).map(([donorId, allocations]) => (
                    <div key={donorId} className="mb-2">
                      <div className="font-medium text-blue-600 dark:text-blue-400">{donorId}:</div>
                      {Object.entries(allocations).map(([causeId, amount]) => (
                        <div key={causeId} className="ml-4 text-xs text-gray-600 dark:text-gray-400">
                          {causeId}: ${amount.toFixed(2)}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Insights Panel */}
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-c42-text-dark-primary mb-2">
                  Agent Insights ({insights.length}/3)
                </h4>
                <div className="space-y-3">
                  {insights.map((insight, index) => (
                    <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        {insight.agent === 'Ethics-Agent' && <Shield className="w-4 h-4 text-c42-accent" />}
                        {insight.agent === 'Impact-Agent' && <BarChart3 className="w-4 h-4 text-c42-secondary" />}
                        {insight.agent === 'Community-Agent' && <Users className="w-4 h-4 text-c42-primary" />}
                        <span className="font-medium text-sm">{insight.agent}</span>
                        <span className="text-xs bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                          {(insight.confidence * 100).toFixed(0)}% confident
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-c42-text-dark-secondary mb-2">
                        {insight.reasoning}
                      </p>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Recommendations: {Object.keys(insight.recommendations).length} adjustments
                      </div>
                    </div>
                  ))}
                  
                  {insights.length < 3 && (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-c42-primary mx-auto mb-2"></div>
                      <p className="text-sm text-gray-600 dark:text-c42-text-dark-secondary">
                        Waiting for more agent insights...
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              {insights.length >= 3 && (
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Brain className="w-4 h-4 text-c42-accent" />
                    <span className="font-medium text-green-700 dark:text-c42-accent">
                      Council Decision Synthesized
                    </span>
                  </div>
                  <p className="text-sm text-green-600 dark:text-c42-accent">
                    All agent insights collected. Allocation has been adjusted based on council recommendations.
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Enhanced Flow Statistics
  const FlowStatistics = ({ data }) => {
    if (!data || !data.allocationHistory.length) return null;
    
    const last24Hours = data.allocationHistory.filter(
      allocation => Date.now() - allocation.timestamp < 24 * 60 * 60 * 1000
    );
    
    const totalFlow = last24Hours.reduce((sum, allocation) => sum + allocation.amount, 0);
    const avgConfidence = last24Hours.reduce((sum, allocation) => sum + (allocation.confidence || 0.8), 0) / last24Hours.length;
    const uniquePairs = new Set(last24Hours.map(a => `${a.donorId}-${a.causeId}`)).size;
    
    return (
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="text-lg font-bold text-c42-secondary">
            ${totalFlow.toFixed(2)}
          </div>
          <div className="text-xs text-gray-600 dark:text-c42-text-dark-secondary">24h Flow</div>
        </div>
        <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="text-lg font-bold text-c42-accent">
            {(avgConfidence * 100).toFixed(0)}%
          </div>
          <div className="text-xs text-gray-600 dark:text-c42-text-dark-secondary">Avg Confidence</div>
        </div>
        <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <div className="text-lg font-bold text-c42-primary">
            {uniquePairs}
          </div>
          <div className="text-xs text-gray-600 dark:text-c42-text-dark-secondary">Flow Pairs</div>
        </div>
      </div>
    );
  };

  // Sankey-style Flow Visualization
  const SankeyFlowChart = ({ data }) => {
    if (!data || !data.allocationHistory.length) {
      return (
        <div className="h-64 flex items-center justify-center text-gray-400 dark:text-c42-text-dark-secondary">
          <div className="text-center">
            <Zap className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No resource flows yet</p>
            <p className="text-sm">Add donors and causes to see flows</p>
          </div>
        </div>
      );
    }
    
    const flowMap = new Map();
    data.allocationHistory.forEach(allocation => {
      const key = `${allocation.donorId}-${allocation.causeId}`;
      if (!flowMap.has(key)) {
        flowMap.set(key, {
          donorId: allocation.donorId,
          causeId: allocation.causeId,
          amount: 0,
          count: 0
        });
      }
      const flow = flowMap.get(key);
      flow.amount += allocation.amount;
      flow.count += 1;
    });
    
    const flows = Array.from(flowMap.values());
    const maxFlow = Math.max(...flows.map(f => f.amount));
    
    const donors = Array.from(new Set(flows.map(f => f.donorId)));
    const causes = Array.from(new Set(flows.map(f => f.causeId)));
    
    return (
      <div className="h-64 p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between h-full">
          <div className="flex flex-col justify-around h-full w-1/3">
            <div className="text-center mb-2">
              <h4 className="text-sm font-medium text-gray-700 dark:text-c42-text-dark-primary">Donors</h4>
            </div>
            {donors.map((donor) => (
              <div key={donor} className="text-center">
                <div className="inline-block px-3 py-2 text-white rounded-lg text-sm font-medium shadow-sm" style={{ backgroundColor: '#06B6D4' }}>
                  {donor}
                </div>
                <div className="text-xs text-gray-500 dark:text-c42-text-dark-secondary mt-1">
                  ${flows.filter(f => f.donorId === donor).reduce((sum, f) => sum + f.amount, 0).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex-1 relative h-full flex items-center justify-center">
            <div className="absolute inset-0 flex items-center justify-center">
              {flows.map((flow, index) => {
                const donorIndex = donors.indexOf(flow.donorId);
                const causeIndex = causes.indexOf(flow.causeId);
                const thickness = Math.max(2, (flow.amount / maxFlow) * 12);
                
                return (
                  <div
                    key={`${flow.donorId}-${flow.causeId}`}
                    className="absolute flex items-center justify-center"
                    style={{
                      top: `${20 + (donorIndex * (60 / Math.max(1, donors.length - 1)))}%`,
                      left: '20%',
                      width: '60%',
                      height: `${thickness}px`,
                      background: `linear-gradient(90deg, #06B6D4, #764ba2)`,
                      borderRadius: '9999px',
                      opacity: 0.7,
                      transform: `translateY(${(causeIndex - donorIndex) * 10}px)`
                    }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs text-white font-medium bg-black bg-opacity-50 px-2 py-1 rounded">
                        ${flow.amount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="text-gray-400 text-2xl z-10">
              <ArrowRight className="w-8 h-8" />
            </div>
          </div>
          
          <div className="flex flex-col justify-around h-full w-1/3">
            <div className="text-center mb-2">
              <h4 className="text-sm font-medium text-gray-700 dark:text-c42-text-dark-primary">Causes</h4>
            </div>
            {causes.map((cause) => (
              <div key={cause} className="text-center">
                <div className="inline-block px-3 py-2 text-white rounded-lg text-sm font-medium shadow-sm" style={{ backgroundColor: '#10B981' }}>
                  {cause.replace('-fund', '')}
                </div>
                <div className="text-xs text-gray-500 dark:text-c42-text-dark-secondary mt-1">
                  ${flows.filter(f => f.causeId === cause).reduce((sum, f) => sum + f.amount, 0).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const FlowVisualization = ({ data }) => {
    if (!data || !data.recentAllocations.length) return null;
    
    const allocations = data.recentAllocations.slice(-3);
    
    return (
      <div className="space-y-2">
        {allocations.map((allocation, index) => (
          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#06B6D4' }}></div>
              <span className="text-sm font-medium text-gray-900 dark:text-c42-text-dark-primary">{allocation.donorId}</span>
              {allocation.councilSynthesized && (
                <span className="text-xs bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400 px-2 py-1 rounded">
                  Council
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-c42-accent font-mono">${allocation.amount.toFixed(2)}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">→</span>
              <span className="text-sm text-gray-900 dark:text-c42-text-dark-primary">{allocation.causeId}</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#030712' }}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-c42-text-dark-primary mb-2">
            🌊 C42 Resource Distributor with Council Review
          </h1>
          <p className="text-gray-600 dark:text-c42-text-dark-secondary">
            Anti-rivalry resource coordination with collaborative AI decision-making
          </p>
        </div>

        <div className="bg-white dark:bg-c42-dark-card rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-c42-text-dark-primary">Live Demo Controls</h2>
            <div className="flex items-center space-x-4">
              <button
                onClick={startAutoMode}
                className={`inline-flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                  isAutoMode 
                    ? 'bg-c42-danger hover:bg-red-600 text-white' 
                    : 'bg-gradient-to-r from-[#667eea] to-[#764ba2] hover:scale-105 text-white font-semibold'
                }`}
              >
                {isAutoMode ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                {isAutoMode ? 'Stop Auto Mode' : 'Start Auto Mode'}
              </button>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="inline-flex items-center px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors text-gray-800 dark:text-gray-200"
              >
                {showDetails ? <Eye className="w-4 h-4 mr-2" /> : <Settings className="w-4 h-4 mr-2" />}
                {showDetails ? 'Hide Details' : 'Show Details'}
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => sendMockDonor({
                id: `donor-${Date.now()}`,
                wallet: Math.floor(Math.random() * 200) + 50,
                percentage: 0.15 + Math.random() * 0.1,
                preferences: {
                  'climate-fund': Math.random(),
                  'journalism-fund': Math.random(),
                  'education-fund': Math.random()
                }
              })}
              className="flex items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
            >
              <Users className="w-5 h-5 mr-2 text-c42-secondary" />
              <span className="text-c42-secondary font-medium">Add Random Donor</span>
            </button>
            
            <button
              onClick={() => sendMockCause({
                id: `cause-${Date.now()}`,
                name: `Initiative ${Math.floor(Math.random() * 1000)}`,
                need: Math.floor(Math.random() * 100) + 20,
                priority: Math.random()
              })}
              className="flex items-center justify-center p-4 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30 rounded-lg transition-colors"
            >
              <Target className="w-5 h-5 mr-2 text-c42-accent" />
              <span className="text-c42-accent font-medium">Add Random Cause</span>
            </button>
            
            <button
              onClick={() => console.log('Dashboard data:', dashboardData)}
              className="flex items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
            >
              <BarChart3 className="w-5 h-5 mr-2 text-c42-primary" />
              <span className="text-c42-primary font-medium">Log Dashboard Data</span>
            </button>
            
            <button
              onClick={() => {
                sendMockDonor({
                  id: 'diana',
                  wallet: 200,
                  percentage: 0.1,
                  preferences: { 'climate-fund': 0.3, 'journalism-fund': 0.3, 'education-fund': 0.3 }
                });
                setTimeout(() => {
                  sendMockCause({
                    id: 'emergency-fund',
                    name: 'Emergency Response Fund',
                    need: 100,
                    priority: 0.95
                  });
                }, 500);
              }}
              className="flex items-center justify-center p-4 bg-orange-50 hover:bg-orange-100 dark:bg-orange-900/20 dark:hover:bg-orange-900/30 rounded-lg transition-colors"
            >
              <Brain className="w-5 h-5 mr-2 text-orange-600" />
              <span className="text-orange-600 font-medium">Trigger Council Review</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-c42-dark-card rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-c42-text-dark-primary">Resource Flows</h3>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-c42-accent rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600 dark:text-c42-text-dark-secondary">Live</span>
              </div>
            </div>
            
            {dashboardData && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-2xl font-bold text-c42-secondary">
                    {dashboardData.activeDonors}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-c42-text-dark-secondary">Active Donors</div>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-2xl font-bold text-c42-accent">
                    {dashboardData.activeCauses}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-c42-text-dark-secondary">Active Causes</div>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-2xl font-bold text-c42-primary">
                    ${dashboardData.totalAllocated.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-c42-text-dark-secondary">Total Allocated</div>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className={`text-2xl font-bold ${dashboardData.councilActive ? 'text-orange-600 dark:text-orange-400' : 'text-gray-600 dark:text-c42-text-dark-secondary'}`}>
                    {dashboardData.councilActive ? '🏛️' : dashboardData.recentAllocations.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-c42-text-dark-secondary">
                    {dashboardData.councilActive ? 'Council Active' : 'Recent Flows'}
                  </div>
                </div>
              </div>
            )}
            
            <FlowStatistics data={dashboardData} />
            
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-c42-text-dark-primary mb-2">Resource Flow Sankey</h4>
              <SankeyFlowChart data={dashboardData} />
            </div>
            
            {dashboardData && dashboardData.recentAllocations.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-c42-text-dark-primary mb-2">Recent Allocations</h4>
                <FlowVisualization data={dashboardData} />
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-c42-dark-card rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-c42-text-dark-primary mb-4">Agent Activity</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-c42-accent rounded-full"></div>
                  <span className="text-sm font-medium text-gray-900 dark:text-c42-text-dark-primary">Distributor-Agent</span>
                </div>
                <span className="text-xs text-gray-500 dark:text-c42-text-dark-secondary">
                  {dashboardData?.councilActive ? 'Council Mode' : 'Ready'}
                </span>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700 dark:text-c42-text-dark-primary">Recent Messages</h4>
                {recentMessages.map((msg) => (
                  <div key={msg.id} className="text-xs text-gray-600 dark:text-c42-text-dark-secondary p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <div className="font-medium">{msg.from} → {msg.topic}</div>
                    <div className="text-gray-500 dark:text-gray-400">{msg.timestamp}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {showDetails && dashboardData && (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-c42-dark-card rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-c42-text-dark-primary mb-4">Active Donors</h3>
              <div className="space-y-3">
                {dashboardData.donors.map((donor) => (
                  <div key={donor.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900 dark:text-c42-text-dark-primary">{donor.id}</span>
                      <span className="text-sm text-gray-600 dark:text-c42-text-dark-secondary">
                        ${donor.wallet.toFixed(2)} wallet
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-c42-text-dark-secondary space-y-1">
                      <div>Budget: ${donor.allocationBudget.toFixed(2)}</div>
                      <div>Trust: {donor.trustLevel}%</div>
                      <div>Preferences: {Object.entries(donor.preferences).map(([cause, weight]) => 
                        `${cause} (${(weight * 100).toFixed(0)}%)`
                      ).join(', ')}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-c42-dark-card rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-c42-text-dark-primary mb-4">Active Causes</h3>
              <div className="space-y-3">
                {dashboardData.causes.map((cause) => (
                  <div key={cause.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900 dark:text-c42-text-dark-primary">{cause.name}</span>
                      <span className="text-sm text-gray-600 dark:text-c42-text-dark-secondary">
                        Priority: {(cause.priority * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-c42-text-dark-secondary space-y-1">
                      <div>Need: ${cause.need.toFixed(2)}</div>
                      <div>Total Received: ${cause.totalReceived.toFixed(2)}</div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div 
                          className="bg-c42-accent h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, (cause.totalReceived / cause.need) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      
      <CouncilModal 
        isOpen={councilData !== null}
        data={councilData}
        onClose={() => setCouncilData(null)}
      />
    </div>
  );
};

export default C42ResourceDistributorDemo;