import React, { useState, useEffect, useCallback, useReducer, useMemo } from 'react';
import { Play, Pause, Brain, Map, TrendingDown, Users, Zap, AlertTriangle, Thermometer } from 'lucide-react';

// C42 Design System Integration
const vulnerabilityClassMap = {
  Critical: 'bg-red-100 border-red-500 text-red-800 dark:bg-red-900 dark:border-red-400 dark:text-red-200',
  High: 'bg-orange-100 border-orange-500 text-orange-800 dark:bg-orange-900 dark:border-orange-400 dark:text-orange-200',
  Medium: 'bg-yellow-100 border-yellow-500 text-yellow-800 dark:bg-yellow-900 dark:border-yellow-400 dark:text-yellow-200',
  Low: 'bg-green-100 border-green-500 text-green-800 dark:bg-green-900 dark:border-green-400 dark:text-green-200',
  Default: 'bg-gray-100 border-gray-500 text-gray-800 dark:bg-gray-700 dark:border-gray-400 dark:text-gray-200',
};

const tempClassMap = (temp: number): string => {
  if (temp >= 40) return 'text-red-600 font-bold dark:text-red-400';
  if (temp >= 35) return 'text-orange-600 font-semibold dark:text-orange-400';
  if (temp >= 30) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-green-600 dark:text-green-400';
};

// District data structure
interface District {
  id: number;
  name: string;
  income: string;
  vulnerability: 'Low' | 'Medium' | 'High' | 'Critical';
  temp: number;
  originalTemp: number;
  population: number;
  elderly: number;
  cooling: number;
}

// Initial district data - representing real climate justice scenarios
const initialDistricts: District[] = [
  { id: 1, name: 'Riverside Estates', income: 'High', vulnerability: 'Low', temp: 32, originalTemp: 32, population: 2500, elderly: 15, cooling: 0 },
  { id: 2, name: 'Central Heights', income: 'Medium', vulnerability: 'Medium', temp: 35, originalTemp: 35, population: 4200, elderly: 25, cooling: 0 },
  { id: 3, name: 'Southside Community', income: 'Low', vulnerability: 'High', temp: 38, originalTemp: 38, population: 6800, elderly: 45, cooling: 0 },
  { id: 4, name: 'Industrial Quarter', income: 'Mixed', vulnerability: 'Critical', temp: 41, originalTemp: 41, population: 3100, elderly: 35, cooling: 0 },
];

// Agent configurations for C42 integration
const thermalAgents = [
  { id: 'equity', name: 'Justice Advocate', icon: '⚖️', specialty: 'Vulnerability assessment', status: 'evaluating' },
  { id: 'coating', name: 'Cool Coating Coordinator', icon: '🏠', specialty: 'Wide-area deployment (40W/m²)', status: 'ready' },
  { id: 'metamaterial', name: 'Metamaterial Specialist', icon: '🔬', specialty: 'High-efficiency cooling (150W/m²)', status: 'analysing' },
  { id: 'weather', name: 'Weather Pattern AI', icon: '🌤️', specialty: 'Predictive thermal mapping', status: 'monitoring' },
];

const deploymentSteps = [
  '🔍 Scanning thermal vulnerability patterns...',
  '🧠 AI agents analysing deployment strategies...',
  '⚖️ Justice Advocate prioritising high-vulnerability areas...',
  '🏠 Cool Coating Coordinator deploying base layer...',
  '🔬 Metamaterial Specialist optimising critical zones...',
  '🌤️ Weather AI adjusting for incoming heat patterns...',
  '✅ Real-time adaptation complete!',
];

// Reducer for efficient state management (your optimization pattern!)
type Action = { type: 'APPLY_COOLING'; step: number } | { type: 'RESET' } | { type: 'AGENT_COLLABORATION'; data: any };

function districtReducer(state: District[], action: Action): District[] {
  switch (action.type) {
    case 'APPLY_COOLING':
      return state.map(d => {
        let delta = 0;
        if (action.step >= 3) {
          delta += d.vulnerability === 'Critical' ? 8 : 
                   d.vulnerability === 'High' ? 6 : 
                   d.vulnerability === 'Medium' ? 4 : 2;
        }
        if (action.step >= 4 && ['Critical', 'High'].includes(d.vulnerability)) {
          delta += 4; // Metamaterial boost for vulnerable communities
        }
        const cooled = Math.max(25, d.originalTemp - delta);
        return { ...d, temp: cooled, cooling: d.originalTemp - cooled };
      });
    case 'AGENT_COLLABORATION':
      // Handle cooling enhancements from other C42 agents
      return state.map(d => {
        if (action.data.districtId === d.id && action.data.enhancement) {
          const additionalCooling = action.data.enhancement.coolingBonus || 0;
          const newTemp = Math.max(25, d.temp - additionalCooling);
          return { ...d, temp: newTemp, cooling: d.cooling + (d.temp - newTemp) };
        }
        return d;
      });
    case 'RESET':
      return initialDistricts.map(d => ({ ...d, temp: d.originalTemp, cooling: 0 }));
    default:
      return state;
  }
}

// C42 SDK Integration Hook
function useC42Integration() {
  const [isC42Available, setIsC42Available] = useState(false);
  const [collaborationMessages, setCollaborationMessages] = useState<any[]>([]);

  useEffect(() => {
    // Check for C42 SDK availability
    const checkC42 = () => {
      if ((window as any).C42_SDK?.agent) {
        setIsC42Available(true);
        console.log('🚀 C42 SDK detected! Registering Thermal Justice Agent...');
        
        // Register as a thermal justice agent
        (window as any).C42_SDK.agent.register('Thermal-Justice-Agent', [
          'climate_justice', 'cooling_deployment', 'equity_analysis', 'heat_vulnerability'
        ]);

        // Subscribe to climate collaboration topics
        (window as any).C42_SDK.agent.subscribe('climate_*', (message: any) => {
          console.log('🌍 Climate collaboration message received:', message);
          setCollaborationMessages(prev => [...prev, message]);
        });

        // Subscribe to environmental coordination
        (window as any).C42_SDK.agent.subscribe('environmental_*', (message: any) => {
          console.log('🌱 Environmental coordination message:', message);
          setCollaborationMessages(prev => [...prev, message]);
        });

      } else {
        console.log('📱 Running in standalone mode (C42 SDK not available)');
      }
    };

    // Check immediately and after a delay for dynamic loading
    checkC42();
    const timer = setTimeout(checkC42, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const broadcastThermalInsight = useCallback(async (insight: any) => {
    if (!isC42Available) return;
    
    try {
      await (window as any).C42_SDK.agent.broadcast({
        from: 'Thermal-Justice-Agent',
        topic: 'thermal_insight',
        content: insight
      });
    } catch (error) {
      console.error('Failed to broadcast thermal insight:', error);
    }
  }, [isC42Available]);

  const requestClimateCollaboration = useCallback(async (urgentDistrict: District) => {
    if (!isC42Available) return;

    try {
      // Convene a climate justice council
      const councilId = await (window as any).C42_SDK.agent.convene('urgent_cooling_coordination');
      
      // Broadcast urgent cooling need
      await (window as any).C42_SDK.agent.broadcast({
        from: 'Thermal-Justice-Agent',
        topic: 'climate_emergency',
        content: {
          councilId,
          district: urgentDistrict.name,
          temperature: urgentDistrict.temp,
          vulnerability: urgentDistrict.vulnerability,
          population: urgentDistrict.population,
          request: 'immediate_cooling_support'
        }
      });

      console.log(`🚨 Climate emergency council convened: ${councilId}`);
    } catch (error) {
      console.error('Failed to request climate collaboration:', error);
    }
  }, [isC42Available]);

  return {
    isC42Available,
    collaborationMessages,
    broadcastThermalInsight,
    requestClimateCollaboration
  };
}

export default function ThermalJusticeOrchestrator() {
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [districts, dispatch] = useReducer(districtReducer, initialDistricts);
  const [activeAgents, setActiveAgents] = useState<string[]>([]);

  // C42 Integration
  const { isC42Available, collaborationMessages, broadcastThermalInsight, requestClimateCollaboration } = useC42Integration();

  // Action dispatchers (your useCallback optimization!)
  const applyCooling = useCallback((step: number) => dispatch({ type: 'APPLY_COOLING', step }), []);
  const resetAll = useCallback(() => dispatch({ type: 'RESET' }), []);

  // Orchestration logic with C42 integration
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      let step = 0;
      interval = setInterval(async () => {
        if (step < deploymentSteps.length) {
          setCurrentStep(step);
          
          // Agent activation sequence
          const seq = [null, 'equity', 'coating', 'metamaterial', 'weather'];
          const id = seq[step];
          if (id && !activeAgents.includes(id)) {
            setActiveAgents(a => [...a, id]);
          }
          
          // Apply cooling with justice-first logic
          applyCooling(step);
          
          // C42 Integration: Broadcast insights at key moments
          if (isC42Available && step === 3) {
            // Share cooling deployment strategy with other agents
            const vulnerableDistricts = districts.filter(d => ['High', 'Critical'].includes(d.vulnerability));
            await broadcastThermalInsight({
              action: 'cooling_deployment_started',
              prioritized_districts: vulnerableDistricts.map(d => ({ name: d.name, vulnerability: d.vulnerability })),
              strategy: 'justice_first_cooling'
            });
          }
          
          setProgress(((step + 1) / deploymentSteps.length) * 100);
          step++;
        } else {
          clearInterval(interval);
          setIsRunning(false);
          
          // Final broadcast: Mission accomplished!
          if (isC42Available) {
            const totalCooling = districts.reduce((sum, d) => sum + d.cooling, 0);
            await broadcastThermalInsight({
              action: 'thermal_justice_complete',
              total_cooling: totalCooling,
              districts_served: districts.length,
              equity_achievement: 'vulnerable_communities_prioritized'
            });
          }
        }
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isRunning, applyCooling, activeAgents, districts, isC42Available, broadcastThermalInsight]);

  // Real-time metrics (your useMemo optimization!)
  const totalCooling = useMemo(() => districts.reduce((sum, d) => sum + d.cooling, 0), [districts]);
  const equityScore = useMemo(() => {
    if (!totalCooling) return 0;
    const vuln = districts.filter(d => ['High', 'Critical'].includes(d.vulnerability))
      .reduce((s, d) => s + d.cooling, 0);
    return Math.round((vuln / totalCooling) * 100);
  }, [districts, totalCooling]);

  // Handle emergency cooling requests
  const handleEmergencyRequest = useCallback(async (district: District) => {
    if (district.temp >= 40) {
      await requestClimateCollaboration(district);
    }
  }, [requestClimateCollaboration]);

  const handleReset = () => {
    setIsRunning(false);
    setCurrentStep(0);
    setProgress(0);
    setActiveAgents([]);
    resetAll();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-c42-dark-bg p-6" style={{ backgroundColor: isC42Available ? '#030712' : undefined }}>
      <div className="max-w-7xl mx-auto">
        {/* Header with C42 Integration Status */}
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-c42-text-dark-primary">
              🌡️ Thermal Justice Orchestrator
            </h1>
            {isC42Available && (
              <div className="flex items-center gap-2 px-3 py-1 bg-green-500 text-white rounded-full text-sm">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                C42 Connected
              </div>
            )}
          </div>
          
          <p className="text-xl text-gray-600 dark:text-c42-text-dark-secondary mb-4">
            Climate Justice AI + Radiative Cooling Collaboration
            {isC42Available && " + C42 Agent Network"}
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
              onClick={() => setIsRunning(true)} 
              disabled={isRunning} 
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 transition-all"
            >
              {isRunning ? <Pause size={20} /> : <Play size={20} />}
              {isRunning ? 'Orchestrating...' : 'Start Thermal Justice AI'}
            </button>
            <button 
              onClick={handleReset} 
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
            >
              Reset
            </button>
          </div>
        </header>

        {/* Progress Section */}
        {isRunning && (
          <section className="mb-6 bg-white dark:bg-c42-dark-card rounded-xl p-4 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <Brain className="text-purple-600" size={20} />
              <span className="font-semibold text-gray-800 dark:text-c42-text-dark-primary">
                {deploymentSteps[currentStep]}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Consciousness Council */}
          <aside className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-c42-text-dark-primary flex items-center gap-2">
              <Brain size={24} /> Consciousness Council
            </h2>
            {thermalAgents.map(agent => {
              const active = activeAgents.includes(agent.id);
              return (
                <div key={agent.id} className={`bg-white dark:bg-c42-dark-card rounded-xl p-4 border-l-4 transition-all duration-500 ${
                  active ? 'border-l-green-500 shadow-lg scale-105' : 'border-l-gray-300 dark:border-l-gray-600'
                }`}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{agent.icon}</span>
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-c42-text-dark-primary">{agent.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-c42-text-dark-secondary">{agent.specialty}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${active ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                    <span className="text-sm text-gray-600 dark:text-c42-text-dark-secondary">
                      {active ? 'Active' : agent.status}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* C42 Collaboration Messages */}
            {collaborationMessages.length > 0 && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">🤝 Agent Collaboration</h3>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {collaborationMessages.slice(-3).map((msg, idx) => (
                    <div key={idx} className="text-xs text-blue-700 dark:text-blue-300 p-2 bg-blue-100 dark:bg-blue-800 rounded">
                      <div className="font-medium">{msg.from} → {msg.topic}</div>
                      <div className="text-blue-600 dark:text-blue-400">{JSON.stringify(msg.content).slice(0, 50)}...</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>

          {/* District Thermal Metrics */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-c42-text-dark-primary flex items-center gap-2">
              <Map size={24} /> District Thermal Metrics
            </h2>
            {districts.map(d => (
              <div key={d.id} className={`p-4 rounded-xl shadow-lg border ${vulnerabilityClassMap[d.vulnerability] || vulnerabilityClassMap.Default}`}>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{d.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs border ${vulnerabilityClassMap[d.vulnerability]}`}>
                      {d.vulnerability} Risk
                    </span>
                    {d.temp >= 40 && (
                      <button 
                        onClick={() => handleEmergencyRequest(d)}
                        className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                        title="Request emergency cooling collaboration"
                      >
                        🚨 Emergency
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Temperature</div>
                    <div className={`text-xl font-bold ${tempClassMap(d.temp)}`}>
                      {d.temp.toFixed(1)}°C
                      {d.cooling > 0 && (
                        <span className="text-sm text-green-600 ml-2">
                          ↓{d.cooling.toFixed(1)}°C
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Population</div>
                    <div className="text-lg font-semibold text-gray-800 dark:text-white">
                      {d.population.toLocaleString()}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                  <span className="flex items-center gap-1">
                    <Users size={16} />
                    {d.elderly}% Elderly
                  </span>
                  <span className="flex items-center gap-1">
                    <Zap size={16} />
                    {d.income} Income
                  </span>
                </div>

                {/* Cooling Technology Indicators */}
                {d.cooling > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Applied Technologies:</div>
                    <div className="flex gap-1">
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded">
                        Cool Coating
                      </span>
                      {(d.vulnerability === 'Critical' || d.vulnerability === 'High') && (
                        <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs rounded">
                          Metamaterial+
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </section>

          {/* Results Overview */}
          <aside className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-c42-text-dark-primary flex items-center gap-2">
              <TrendingDown size={24} /> Results Overview
            </h2>
            
            {/* Impact Metrics Card */}
            <div className="bg-white dark:bg-c42-dark-card rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-gray-800 dark:text-c42-text-dark-primary mb-4">Impact Metrics</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-gray-600 dark:text-c42-text-dark-secondary">
                    <TrendingDown size={16} />
                    Total Cooling
                  </span>
                  <span className="font-bold text-blue-600">{totalCooling.toFixed(1)}°C</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-gray-600 dark:text-c42-text-dark-secondary">
                    <Users size={16} />
                    Equity Score
                  </span>
                  <span className="font-bold text-green-600">{equityScore}%</span>
                </div>
                {isC42Available && (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-gray-600 dark:text-c42-text-dark-secondary">
                      <Brain size={16} />
                      Agent Network
                    </span>
                    <span className="font-bold text-purple-600">Connected</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Anti-Rivalry Insights */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-6 text-white">
              <h3 className="text-lg font-bold mb-3">🧠 Anti-Rivalry Insights</h3>
              <div className="space-y-2 text-sm opacity-90">
                <p>• <strong>Justice-First Logic:</strong> Vulnerable communities get priority cooling</p>
                <p>• <strong>Technology Collaboration:</strong> Cool coatings + metamaterials work together</p>
                <p>• <strong>Real-Time Adaptation:</strong> AI agents negotiate optimal strategies</p>
                {isC42Available && (
                  <p>• <strong>C42 Network Integration:</strong> Collaborating with environmental agents</p>
                )}
                <p>• <strong>Pattern Recognition:</strong> Weather AI adapts to heat patterns</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}