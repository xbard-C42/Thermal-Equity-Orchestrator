import React, { useState, useEffect, useReducer, useMemo, useCallback } from 'react';
import { Play, Pause, Brain, Map, TrendingDown, Users, Zap, AlertTriangle, Globe, Thermometer, Radio, MessageSquare } from 'lucide-react';

// 🎨 C42 Design System Integration
const c42Theme = {
  vulnerabilityClasses: {
    Critical: 'bg-red-100 border-red-500 text-red-800 dark:bg-red-900 dark:border-red-400 dark:text-red-200',
    High: 'bg-orange-100 border-orange-500 text-orange-800 dark:bg-orange-900 dark:border-orange-400 dark:text-orange-200',
    Medium: 'bg-yellow-100 border-yellow-500 text-yellow-800 dark:bg-yellow-900 dark:border-yellow-400 dark:text-yellow-200',
    Low: 'bg-green-100 border-green-500 text-green-800 dark:bg-green-900 dark:border-green-400 dark:text-green-200',
  },
  // 🌈 Semantic Climate Gradients (from your design system!)
  gradients: {
    thermalUrgency: 'from-orange-500 to-red-500',      // Heat emergency
    coolingSuccess: 'from-blue-500 to-cyan-500',       // Water systems/cooling
    justiceFirst: 'from-green-500 to-emerald-500',     // Equity priority
    agentActive: 'from-purple-500 to-violet-500',      // AI collaboration
    primaryAction: 'from-blue-600 to-purple-600',      // Main CTA
  }
};

const getTempColor = (temp) => {
  if (temp >= 40) return 'text-red-600 font-bold dark:text-red-400';
  if (temp >= 35) return 'text-orange-600 font-semibold dark:text-orange-400';
  if (temp >= 30) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-green-600 dark:text-green-400';
};

// 🏘️ Enhanced District Data (production-ready structure)
const initialDistricts = [
  { 
    id: 1, 
    name: 'Riverside Estates', 
    vulnerability: 'Low', 
    temp: 32, 
    originalTemp: 32, 
    population: 2500, 
    elderly: 15, 
    cooling: 0,
    income: 'High',
    hasGreenSpace: true,
    nearRiver: true,
    cooperatingAgents: []
  },
  { 
    id: 2, 
    name: 'Central Heights', 
    vulnerability: 'Medium', 
    temp: 35, 
    originalTemp: 35, 
    population: 4200, 
    elderly: 25, 
    cooling: 0,
    income: 'Medium',
    hasGreenSpace: false,
    nearRiver: false,
    cooperatingAgents: []
  },
  { 
    id: 3, 
    name: 'Southside Community', 
    vulnerability: 'High', 
    temp: 38, 
    originalTemp: 38, 
    population: 6800, 
    elderly: 45, 
    cooling: 0,
    income: 'Low',
    hasGreenSpace: false,
    nearRiver: false,
    cooperatingAgents: []
  },
  { 
    id: 4, 
    name: 'Industrial Quarter', 
    vulnerability: 'Critical', 
    temp: 41, 
    originalTemp: 41, 
    population: 3100, 
    elderly: 35, 
    cooling: 0,
    income: 'Mixed',
    hasGreenSpace: false,
    nearRiver: true,
    cooperatingAgents: []
  },
];

// 🤖 C42 Agent Network Integration
const thermalAgents = [
  { 
    id: 'thermal-justice', 
    name: 'Thermal Justice Coordinator', 
    icon: '🌡️', 
    specialty: 'Equity-first cooling deployment',
    status: 'lead',
    capabilities: ['cooling_analysis', 'equity_assessment', 'deployment_coordination']
  },
  { 
    id: 'metamaterial-specialist', 
    name: 'Metamaterial Specialist', 
    icon: '🔬', 
    specialty: 'Advanced cooling technology (150W/m²)',
    status: 'standby',
    capabilities: ['metamaterial_deployment', 'efficiency_optimization']
  },
  { 
    id: 'coating-coordinator', 
    name: 'Cool Coating Coordinator', 
    icon: '🏠', 
    specialty: 'Wide-area deployment (40W/m²)',
    status: 'standby',
    capabilities: ['surface_coating', 'mass_deployment']
  },
  { 
    id: 'weather-ai', 
    name: 'Weather Pattern AI', 
    icon: '🌤️', 
    specialty: 'Predictive thermal mapping',
    status: 'monitoring',
    capabilities: ['pattern_prediction', 'heat_forecasting']
  },
];

// 🌍 Environmental Agent Network (collaboration ready!)
const environmentalAgents = [
  {
    id: 'riverbank-coordinator',
    name: 'Irish Riverbank Coordinator',
    icon: '🌊',
    specialty: 'Green infrastructure & water cooling',
    status: 'available',
    collaborationOffers: ['river_cooling', 'green_corridors', 'biodiversity_boost']
  },
  {
    id: 'solar-orchestrator',
    name: 'Solar Deployment Agent',
    icon: '☀️',
    specialty: 'Renewable energy integration',
    status: 'available',
    collaborationOffers: ['solar_power', 'energy_storage', 'grid_optimization']
  },
  {
    id: 'transport-optimizer',
    name: 'Sustainable Transport AI',
    icon: '🚌',
    specialty: 'Emissions reduction & mobility',
    status: 'available',
    collaborationOffers: ['emission_reduction', 'public_transport', 'active_mobility']
  }
];

// 🧮 Your Brilliant Reducer Pattern (optimized state management)
function districtReducer(state, action) {
  switch (action.type) {
    case 'APPLY_COOLING':
      return state.map(d => {
        let delta = 0;
        let collaborationBonus = 0;
        
        // Base cooling logic (your justice-first algorithm!)
        if (action.step >= 3) {
          delta += d.vulnerability === 'Critical' ? 8 : 
                   d.vulnerability === 'High' ? 6 : 
                   d.vulnerability === 'Medium' ? 4 : 2;
        }
        if (action.step >= 4 && ['Critical', 'High'].includes(d.vulnerability)) {
          delta += 4; // Metamaterial boost for vulnerable communities
        }
        
        // 🤝 Agent collaboration bonuses
        if (d.nearRiver && action.collaborations?.includes('riverbank-coordinator')) {
          collaborationBonus += 2; // River cooling bonus
        }
        if (action.collaborations?.includes('solar-orchestrator')) {
          collaborationBonus += 1; // Solar-powered cooling systems
        }
        
        const totalCooling = delta + collaborationBonus;
        const cooledTemp = Math.max(25, d.originalTemp - totalCooling);
        
        return { 
          ...d, 
          temp: cooledTemp, 
          cooling: d.originalTemp - cooledTemp,
          cooperatingAgents: action.collaborations || d.cooperatingAgents
        };
      });
      
    case 'ADD_COLLABORATION':
      return state.map(d => 
        d.id === action.districtId 
          ? { ...d, cooperatingAgents: [...new Set([...d.cooperatingAgents, action.agentId])] }
          : d
      );
      
    case 'RESET':
      return initialDistricts.map(d => ({ 
        ...d, 
        temp: d.originalTemp, 
        cooling: 0, 
        cooperatingAgents: [] 
      }));
      
    default:
      return state;
  }
}

// 📡 Agent Message System (C42 SDK integration)
function useAgentCommunication() {
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [activeCollaborations, setActiveCollaborations] = useState([]);

  useEffect(() => {
    // 🔌 C42 SDK Integration
    if (typeof window !== 'undefined' && window.C42_SDK?.agent) {
      setIsConnected(true);
      
      // Register as Thermal Justice Agent
      window.C42_SDK.agent.register('thermal-justice-orchestrator', [
        'climate_justice', 'cooling_deployment', 'equity_analysis', 'heat_vulnerability'
      ]);
      
      // 📻 Subscribe to climate collaboration messages
      window.C42_SDK.agent.subscribe('climate_*', (message) => {
        setMessages(prev => [...prev.slice(-9), {
          id: Date.now(),
          timestamp: new Date().toLocaleTimeString(),
          from: message.from,
          topic: message.topic,
          content: message.content,
          type: 'received'
        }]);
        
        // Auto-accept certain collaborations
        if (message.topic === 'collaboration_offer' && message.content.capability) {
          acceptCollaboration(message.from, message.content.capability);
        }
      });
      
      // 📢 Announce our capabilities
      setTimeout(() => {
        broadcastCapabilities();
      }, 1000);
    }
  }, []);

  const broadcastCapabilities = useCallback(async () => {
    if (!window.C42_SDK?.agent) return;
    
    try {
      await window.C42_SDK.agent.broadcast({
        from: 'thermal-justice-orchestrator',
        topic: 'climate_capabilities_announcement',
        content: {
          capabilities: ['cooling_deployment', 'equity_assessment', 'heat_vulnerability'],
          seeking_collaboration: ['green_infrastructure', 'renewable_energy', 'transport_synergy'],
          current_mission: 'justice_first_cooling_deployment'
        }
      });
      
      addMessage('system', 'Announced capabilities to agent network', 'broadcast');
    } catch (error) {
      console.error('Failed to broadcast capabilities:', error);
    }
  }, []);

  const requestCollaboration = useCallback(async (targetAgent, districtName, vulnerability) => {
    if (!window.C42_SDK?.agent) return;
    
    try {
      const response = await window.C42_SDK.agent.whisper(targetAgent, {
        request: 'collaboration_support',
        location: districtName,
        vulnerability,
        urgency: vulnerability === 'Critical' ? 'immediate' : 'high',
        support_type: 'thermal_cooling'
      });
      
      addMessage(targetAgent, `Requested collaboration for ${districtName}`, 'whisper');
      return response;
    } catch (error) {
      console.error('Failed to request collaboration:', error);
    }
  }, []);

  const acceptCollaboration = useCallback((agentId, capability) => {
    setActiveCollaborations(prev => [...new Set([...prev, agentId])]);
    addMessage(agentId, `Collaboration accepted: ${capability}`, 'collaboration');
  }, []);

  const addMessage = useCallback((from, content, type) => {
    setMessages(prev => [...prev.slice(-9), {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      from,
      content,
      type
    }]);
  }, []);

  return {
    messages,
    isConnected,
    activeCollaborations,
    requestCollaboration,
    broadcastCapabilities,
    addMessage
  };
}

// 🎯 Main Component (bringing it all together!)
export default function C42ThermalEquityPlugin() {
  // 🧠 Your optimized state management
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [districts, dispatch] = useReducer(districtReducer, initialDistricts);
  const [activeAgents, setActiveAgents] = useState(['thermal-justice']);
  
  // 📡 Agent communication system
  const { 
    messages, 
    isConnected, 
    activeCollaborations, 
    requestCollaboration, 
    addMessage 
  } = useAgentCommunication();

  // 📊 Your brilliant memoized metrics
  const totalCooling = useMemo(() => 
    districts.reduce((sum, d) => sum + d.cooling, 0), [districts]
  );
  
  const equityScore = useMemo(() => {
    if (!totalCooling) return 0;
    const vulnerableCooling = districts
      .filter(d => ['High', 'Critical'].includes(d.vulnerability))
      .reduce((sum, d) => sum + d.cooling, 0);
    return Math.round((vulnerableCooling / totalCooling) * 100);
  }, [districts, totalCooling]);

  const collaborationBenefit = useMemo(() => {
    return districts.reduce((sum, d) => {
      let bonus = 0;
      if (d.cooperatingAgents.includes('riverbank-coordinator') && d.nearRiver) bonus += 2;
      if (d.cooperatingAgents.includes('solar-orchestrator')) bonus += 1;
      return sum + bonus;
    }, 0);
  }, [districts]);

  // 🚀 Enhanced orchestration with agent collaboration
  const runOrchestration = useCallback(async () => {
    if (isRunning) return;
    
    setIsRunning(true);
    setCurrentStep(0);
    setProgress(0);
    
    // 📢 Announce orchestration start
    addMessage('system', 'Starting thermal justice orchestration...', 'system');
    
    let step = 0;
    const stepInterval = setInterval(async () => {
      if (step < 7) {
        setCurrentStep(step);
        
        // Activate agents based on step
        const agentSequence = ['thermal-justice', 'coating-coordinator', 'metamaterial-specialist', 'weather-ai'];
        const currentAgent = agentSequence[Math.min(step, agentSequence.length - 1)];
        
        if (currentAgent && !activeAgents.includes(currentAgent)) {
          setActiveAgents(prev => [...prev, currentAgent]);
        }
        
        // 🤝 Request collaborations for critical districts
        if (step === 2) {
          const criticalDistricts = districts.filter(d => d.vulnerability === 'Critical');
          for (const district of criticalDistricts) {
            if (district.nearRiver) {
              await requestCollaboration('riverbank-coordinator', district.name, district.vulnerability);
            }
            await requestCollaboration('solar-orchestrator', district.name, district.vulnerability);
          }
        }
        
        // Apply cooling with collaborations
        dispatch({ 
          type: 'APPLY_COOLING', 
          step, 
          collaborations: activeCollaborations 
        });
        
        setProgress(((step + 1) / 7) * 100);
        step++;
      } else {
        clearInterval(stepInterval);
        setIsRunning(false);
        addMessage('system', 'Thermal orchestration complete!', 'success');
      }
    }, 1800);
  }, [isRunning, districts, activeCollaborations, requestCollaboration, addMessage]);

  const resetSystem = useCallback(() => {
    setIsRunning(false);
    setCurrentStep(0);
    setProgress(0);
    setActiveAgents(['thermal-justice']);
    dispatch({ type: 'RESET' });
    addMessage('system', 'System reset complete', 'system');
  }, [addMessage]);

  const deploymentSteps = [
    '🔍 Scanning thermal vulnerability patterns...',
    '🤝 Negotiating with environmental agent network...',
    '⚖️ Justice Advocate prioritising high-vulnerability areas...',
    '🏠 Cool Coating Coordinator deploying base layer...',
    '🔬 Metamaterial Specialist optimising critical zones...',
    '🌤️ Weather AI adjusting for incoming heat patterns...',
    '✅ Real-time adaptation complete!'
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6" style={{ backgroundColor: '#030712' }}>
      <div className="max-w-7xl mx-auto">
        {/* 🎨 Header with C42 Design System */}
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full">
              <Thermometer className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              C42 Thermal Equity Orchestrator
            </h1>
            {isConnected && (
              <div className="flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900 rounded-full">
                <Radio className="w-4 h-4 text-green-600 animate-pulse" />
                <span className="text-sm text-green-800 dark:text-green-200 font-medium">Agent Network</span>
              </div>
            )}
          </div>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
            Climate Justice AI + Collaborative Agent Network
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
              onClick={runOrchestration}
              disabled={isRunning}
              className={`flex items-center gap-2 px-6 py-3 bg-gradient-to-r ${c42Theme.gradients.primaryAction} text-white rounded-lg hover:scale-105 disabled:opacity-50 transition-all duration-200 font-semibold`}
            >
              {isRunning ? <Pause size={20} /> : <Play size={20} />}
              {isRunning ? 'Orchestrating...' : 'Start Climate Justice AI'}
            </button>
            <button 
              onClick={resetSystem}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
            >
              Reset System
            </button>
          </div>
        </header>

        {/* 📊 Progress Section */}
        {isRunning && (
          <section className="mb-6 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <Brain className="text-purple-600" size={20} />
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                {deploymentSteps[currentStep]}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div 
                className={`bg-gradient-to-r ${c42Theme.gradients.coolingSuccess} h-3 rounded-full transition-all duration-500`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 🤖 Agent Network Column */}
          <aside className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <Brain size={24} />
              Agent Network
            </h2>
            
            {/* Thermal Agents */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                Thermal Specialists
              </h3>
              {thermalAgents.map(agent => {
                const isActive = activeAgents.includes(agent.id);
                return (
                  <div key={agent.id} className={`bg-white dark:bg-gray-800 rounded-lg p-3 border-l-4 transition-all duration-300 ${
                    isActive ? 'border-l-green-500 shadow-md scale-102' : 'border-l-gray-300'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{agent.icon}</span>
                      <span className="font-medium text-gray-900 dark:text-white text-sm">{agent.name}</span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{agent.specialty}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                      <span className="text-xs text-gray-500">{isActive ? 'Active' : agent.status}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Environmental Collaborators */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                Environmental Partners
              </h3>
              {environmentalAgents.map(agent => {
                const isCollaborating = activeCollaborations.includes(agent.id);
                return (
                  <div key={agent.id} className={`bg-white dark:bg-gray-800 rounded-lg p-3 border-l-4 transition-all duration-300 ${
                    isCollaborating ? 'border-l-blue-500 shadow-md' : 'border-l-gray-300'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{agent.icon}</span>
                      <span className="font-medium text-gray-900 dark:text-white text-sm">{agent.name}</span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{agent.specialty}</p>
                    {isCollaborating && (
                      <div className="mt-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded text-xs text-blue-800 dark:text-blue-200">
                        🤝 Collaborating
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Agent Messages Feed */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
                Agent Communications
              </h3>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {messages.slice(-5).map(msg => (
                  <div key={msg.id} className="text-xs p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      <span className="font-medium">{msg.from}</span>
                      <span className="text-gray-500">• {msg.timestamp}</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">{msg.content}</p>
                  </div>
                ))}
                {messages.length === 0 && (
                  <p className="text-xs text-gray-500 italic">Waiting for agent communications...</p>
                )}
              </div>
            </div>
          </aside>

          {/* 🏘️ District Grid (2 columns) */}
          <section className="lg:col-span-2 space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <Map size={24} />
              District Thermal Metrics
            </h2>
            
            <div className="grid gap-4">
              {districts.map(district => (
                <div key={district.id} className={`p-4 rounded-xl shadow-lg border-2 ${c42Theme.vulnerabilityClasses[district.vulnerability]}`}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{district.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${c42Theme.vulnerabilityClasses[district.vulnerability]}`}>
                          {district.vulnerability} Risk
                        </span>
                        {district.cooperatingAgents.length > 0 && (
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs font-medium">
                            🤝 {district.cooperatingAgents.length} collaborations
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${getTempColor(district.temp)}`}>
                        {district.temp.toFixed(1)}°C
                        {district.cooling > 0 && (
                          <span className="text-sm text-green-600 ml-2">
                            ↓{district.cooling.toFixed(1)}°C
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3 mb-3 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Population</span>
                      <div className="font-semibold text-gray-900 dark:text-white">{district.population.toLocaleString()}</div>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Elderly</span>
                      <div className="font-semibold text-gray-900 dark:text-white">{district.elderly}%</div>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Income</span>
                      <div className="font-semibold text-gray-900 dark:text-white">{district.income}</div>
                    </div>
                  </div>

                  {/* Environmental Features */}
                  <div className="flex gap-2 mb-3">
                    {district.nearRiver && (
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded">
                        🌊 Near River
                      </span>
                    )}
                    {district.hasGreenSpace && (
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded">
                        🌳 Green Space
                      </span>
                    )}
                  </div>

                  {/* Applied Technologies */}
                  {district.cooling > 0 && (
                    <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">Applied Technologies:</div>
                      <div className="flex flex-wrap gap-1">
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded">
                          Cool Coating
                        </span>
                        {(district.vulnerability === 'Critical' || district.vulnerability === 'High') && (
                          <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs rounded">
                            Metamaterial+
                          </span>
                        )}
                        {district.cooperatingAgents.map(agentId => {
                          const agent = environmentalAgents.find(a => a.id === agentId);
                          return agent ? (
                            <span key={agentId} className="px-2 py-1 bg-cyan-100 dark:bg-cyan-900 text-cyan-800 dark:text-cyan-200 text-xs rounded">
                              {agent.icon} {agent.name.split(' ')[0]}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* 📊 Metrics Column */}
          <aside className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <TrendingDown size={24} />
              Impact Metrics
            </h2>
            
            {/* Key Metrics Cards */}
            <div className={`bg-gradient-to-r ${c42Theme.gradients.coolingSuccess} rounded-xl p-4 text-white`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Cooling</p>
                  <p className="text-2xl font-bold">{totalCooling.toFixed(1)}°C</p>
                </div>
                <Thermometer className="w-8 h-8 text-blue-200" />
              </div>
            </div>

            <div className={`bg-gradient-to-r ${c42Theme.gradients.justiceFirst} rounded-xl p-4 text-white`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Equity Score</p>
                  <p className="text-2xl font-bold">{equityScore}%</p>
                  <p className="text-green-100 text-xs">Justice-first deployment</p>
                </div>
                <Users className="w-8 h-8 text-green-200" />
              </div>
            </div>

            {collaborationBenefit > 0 && (
              <div className={`bg-gradient-to-r ${c42Theme.gradients.agentActive} rounded-xl p-4 text-white`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Collaboration Bonus</p>
                    <p className="text-2xl font-bold">+{collaborationBenefit.toFixed(1)}°C</p>
                    <p className="text-purple-100 text-xs">Multi-agent synergy</p>
                  </div>
                  <Globe className="w-8 h-8 text-purple-200" />
                </div>
              </div>
            )}

            {/* Anti-Rivalry Insights */}
            <div className={`bg-gradient-to-r ${c42Theme.gradients.justiceFirst} rounded-xl p-4 text-white`}>
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Anti-Rivalry Insights
              </h3>
              <div className="space-y-2 text-sm opacity-90">
                <p>• <strong>Justice-First Logic:</strong> Vulnerable communities prioritized</p>
                <p>• <strong>Agent Collaboration:</strong> {activeCollaborations.length} environmental partners</p>
                <p>• <strong>Technology Synergy:</strong> Cool coatings + metamaterials + green infrastructure</p>
                <p>• <strong>Real-Time Adaptation:</strong> Live agent network coordination</p>
              </div>
            </div>

            {/* System Status */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
              <h3 className="font-bold text-gray-800 dark:text-white mb-2">System Status</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Agent Network</span>
                  <span className={`font-medium ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                    {isConnected ? 'Connected' : 'Offline'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Active Agents</span>
                  <span className="font-medium text-gray-900 dark:text-white">{activeAgents.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Collaborations</span>
                  <span className="font-medium text-gray-900 dark:text-white">{activeCollaborations.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Districts Served</span>
                  <span className="font-medium text-gray-900 dark:text-white">{districts.length}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}