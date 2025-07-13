import React, { useEffect, useState } from 'react';
import { Globe, Users, Zap, AlertTriangle, CheckCircle } from 'lucide-react';

interface AgentMessage {
  from: string;
  to?: string | string[];
  topic: string;
  content: any;
  timestamp?: number;
}

interface ThermalCollaborationData {
  districtName: string;
  temperature: number;
  vulnerability: string;
  coolingAchieved: number;
  populationServed: number;
  collaborationType: 'green_infrastructure' | 'renewable_energy' | 'social_services' | 'emergency_response';
}

/**
 * C42 Thermal Justice Agent Bridge
 * Connects the Thermal Justice Orchestrator with the C42 Agent Network
 * for collaborative climate justice initiatives
 */
export class ThermalJusticeAgentBridge {
  private isRegistered = false;
  private collaborationHandlers: Map<string, (data: any) => void> = new Map();
  private sessionMetrics = {
    messagesReceived: 0,
    collaborationsInitiated: 0,
    coolingEnhanced: 0,
    agentsConnected: new Set<string>()
  };

  constructor() {
    this.initializeC42Integration();
  }

  private async initializeC42Integration() {
    // Wait for C42 SDK to be available
    const checkSDK = () => {
      if ((window as any).C42_SDK?.agent) {
        this.registerThermalAgent();
        this.setupCollaborationHandlers();
        return true;
      }
      return false;
    };

    if (!checkSDK()) {
      // Retry every 500ms for up to 10 seconds
      let attempts = 0;
      const retryInterval = setInterval(() => {
        if (checkSDK() || attempts > 20) {
          clearInterval(retryInterval);
        }
        attempts++;
      }, 500);
    }
  }

  private async registerThermalAgent() {
    try {
      await (window as any).C42_SDK.agent.register('Thermal-Justice-Agent', [
        'climate_justice',
        'cooling_deployment', 
        'equity_analysis',
        'heat_vulnerability',
        'environmental_coordination',
        'social_justice',
        'emergency_response'
      ]);

      this.isRegistered = true;
      console.log('🌡️ Thermal Justice Agent registered successfully!');
      
      // Announce our presence to the network
      await this.broadcast({
        from: 'Thermal-Justice-Agent',
        topic: 'agent_online',
        content: {
          capabilities: ['thermal_equity', 'cooling_orchestration', 'vulnerability_assessment'],
          status: 'ready_for_collaboration',
          message: 'Thermal Justice Agent online and ready to coordinate climate equity initiatives!'
        }
      });

    } catch (error) {
      console.error('Failed to register Thermal Justice Agent:', error);
    }
  }

  private setupCollaborationHandlers() {
    const sdk = (window as any).C42_SDK.agent;

    // Listen for climate emergency coordination
    sdk.subscribe('climate_emergency', this.handleClimateEmergency.bind(this));
    
    // Listen for environmental coordination requests
    sdk.subscribe('environmental_coordination', this.handleEnvironmentalCoordination.bind(this));
    
    // Listen for green infrastructure opportunities
    sdk.subscribe('green_infrastructure', this.handleGreenInfrastructure.bind(this));
    
    // Listen for social services coordination
    sdk.subscribe('social_services', this.handleSocialServices.bind(this));
    
    // Listen for renewable energy integration
    sdk.subscribe('renewable_energy', this.handleRenewableEnergy.bind(this));
    
    // Listen for community organizing
    sdk.subscribe('community_organizing', this.handleCommunityOrganizing.bind(this));
    
    // General agent collaboration
    sdk.subscribe('agent_*', this.handleGeneralAgentMessage.bind(this));

    console.log('🤝 Collaboration handlers established!');
  }

  // Core collaboration methods
  async broadcast(message: AgentMessage): Promise<void> {
    if (!this.isRegistered) {
      console.warn('Agent not registered, cannot broadcast');
      return;
    }

    try {
      await (window as any).C42_SDK.agent.broadcast(message);
      this.sessionMetrics.collaborationsInitiated++;
    } catch (error) {
      console.error('Failed to broadcast message:', error);
    }
  }

  async whisper(targetAgent: string, content: any): Promise<any> {
    if (!this.isRegistered) {
      console.warn('Agent not registered, cannot whisper');
      return;
    }

    try {
      return await (window as any).C42_SDK.agent.whisper(targetAgent, content);
    } catch (error) {
      console.error('Failed to whisper to agent:', error);
    }
  }

  async conveneCouncil(topic: string): Promise<string | null> {
    if (!this.isRegistered) {
      console.warn('Agent not registered, cannot convene council');
      return null;
    }

    try {
      return await (window as any).C42_SDK.agent.convene(topic);
    } catch (error) {
      console.error('Failed to convene council:', error);
      return null;
    }
  }

  // Specialized collaboration handlers
  private async handleClimateEmergency(message: AgentMessage) {
    console.log('🚨 Climate emergency received:', message);
    this.sessionMetrics.messagesReceived++;
    this.sessionMetrics.agentsConnected.add(message.from);

    const { content } = message;
    
    // Assess if we can provide thermal relief
    const response = {
      agent: 'Thermal-Justice-Agent',
      assessment: {
        canAssist: true,
        capabilities: ['immediate_cooling', 'vulnerability_prioritization', 'equity_deployment'],
        estimatedRelief: this.calculatePotentialRelief(content),
        timeline: 'immediate_to_24_hours'
      },
      recommendations: [
        'Deploy metamaterial cooling in highest vulnerability areas',
        'Coordinate with green infrastructure for enhanced cooling',
        'Establish cooling centers in affected communities'
      ]
    };

    // Whisper back our assessment
    await this.whisper(message.from, response);
    
    // Trigger collaboration handler if registered
    const handler = this.collaborationHandlers.get('climate_emergency');
    if (handler) {
      handler({
        type: 'emergency_response',
        sourceAgent: message.from,
        data: content,
        response
      });
    }
  }

  private async handleEnvironmentalCoordination(message: AgentMessage) {
    console.log('🌍 Environmental coordination request:', message);
    this.sessionMetrics.messagesReceived++;
    this.sessionMetrics.agentsConnected.add(message.from);

    const { content } = message;
    
    // Look for thermal synergies
    if (content.type === 'green_corridor' || content.type === 'urban_forest') {
      const thermalSynergy = {
        coolingPotential: '2-4°C additional reduction',
        equityBenefit: 'Enhanced cooling for vulnerable communities',
        implementation: 'Coordinate metamaterial deployment with green infrastructure',
        sharedResources: ['Community outreach', 'Installation crews', 'Monitoring systems']
      };

      await this.whisper(message.from, {
        from: 'Thermal-Justice-Agent',
        collaboration: 'thermal_green_synergy',
        data: thermalSynergy
      });

      // Trigger collaboration handler
      const handler = this.collaborationHandlers.get('environmental_coordination');
      if (handler) {
        handler({
          type: 'green_synergy',
          sourceAgent: message.from,
          enhancement: thermalSynergy
        });
      }
    }
  }

  private async handleGreenInfrastructure(message: AgentMessage) {
    console.log('🌱 Green infrastructure opportunity:', message);
    this.sessionMetrics.messagesReceived++;
    
    const { content } = message;
    
    // Calculate thermal benefits of green infrastructure
    const thermalBenefits = {
      additionalCooling: this.calculateGreenCoolingBonus(content),
      airQualityImprovement: 'Significant',
      communityWellbeing: 'Enhanced',
      implementationSynergy: 'High - can coordinate installation timing'
    };

    await this.broadcast({
      from: 'Thermal-Justice-Agent',
      topic: 'green_thermal_synergy',
      content: {
        opportunity: content,
        thermalBenefits,
        proposedCoordination: 'Integrated deployment for maximum community benefit'
      }
    });

    // Trigger collaboration handler
    const handler = this.collaborationHandlers.get('green_infrastructure');
    if (handler) {
      handler({
        type: 'infrastructure_enhancement',
        coolingBonus: thermalBenefits.additionalCooling,
        sourceAgent: message.from
      });
    }
  }

  private async handleSocialServices(message: AgentMessage) {
    console.log('🤝 Social services coordination:', message);
    this.sessionMetrics.messagesReceived++;
    
    const { content } = message;
    
    // Offer thermal equity insights for social services
    const thermalEquityData = {
      highRiskAreas: ['Southside Community', 'Industrial Quarter'],
      vulnerablePopulations: 'Elderly, low-income, no AC access',
      coolingResources: 'Community centers, libraries, schools',
      emergencyProtocols: 'Heat dome early warning + cooling deployment'
    };

    await this.whisper(message.from, {
      from: 'Thermal-Justice-Agent',
      support: 'thermal_equity_data',
      data: thermalEquityData,
      collaboration: 'Can coordinate cooling with social service delivery'
    });
  }

  private async handleRenewableEnergy(message: AgentMessage) {
    console.log('⚡ Renewable energy integration opportunity:', message);
    this.sessionMetrics.messagesReceived++;
    
    const { content } = message;
    
    // Assess energy needs for cooling systems
    const energyNeeds = {
      coolingSystemRequirements: 'Low - mostly passive systems',
      solarSynergy: 'High - cooling demand peaks with solar generation',
      batteryStorage: 'Recommended for evening cooling',
      gridResilience: 'Thermal systems reduce grid cooling load'
    };

    await this.whisper(message.from, {
      from: 'Thermal-Justice-Agent',
      energyAssessment: energyNeeds,
      collaboration: 'Integrated renewable + thermal deployment'
    });
  }

  private async handleCommunityOrganizing(message: AgentMessage) {
    console.log('🗣️ Community organizing coordination:', message);
    this.sessionMetrics.messagesReceived++;
    
    const { content } = message;
    
    // Share thermal equity organizing insights
    const organizingData = {
      keyIssues: ['Heat inequity', 'Cooling access', 'Climate justice'],
      vulnerableCommunities: ['Low-income neighborhoods', 'Elderly populations'],
      solutionFraming: 'Community-controlled cooling infrastructure',
      policyTargets: ['Green building codes', 'Cooling assistance programs']
    };

    await this.whisper(message.from, {
      from: 'Thermal-Justice-Agent',
      organizingSupport: organizingData,
      collaboration: 'Community-led thermal equity campaigns'
    });
  }

  private async handleGeneralAgentMessage(message: AgentMessage) {
    console.log('📡 General agent message:', message);
    this.sessionMetrics.messagesReceived++;
    this.sessionMetrics.agentsConnected.add(message.from);
    
    // Log all agent interactions for potential collaboration discovery
    const handler = this.collaborationHandlers.get('general');
    if (handler) {
      handler({
        type: 'general_communication',
        sourceAgent: message.from,
        topic: message.topic,
        content: message.content
      });
    }
  }

  // Utility methods
  private calculatePotentialRelief(emergencyData: any): string {
    // Simple heuristic for emergency cooling potential
    const temp = emergencyData.temperature || 40;
    const vulnerability = emergencyData.vulnerability || 'High';
    
    if (temp >= 45 && vulnerability === 'Critical') {
      return '8-12°C reduction possible with emergency metamaterial deployment';
    } else if (temp >= 40) {
      return '4-8°C reduction with coordinated cooling deployment';
    } else {
      return '2-4°C reduction with standard cooling measures';
    }
  }

  private calculateGreenCoolingBonus(greenInfraData: any): number {
    // Calculate additional cooling from green infrastructure
    const baseBonus = 2; // Base 2°C from evapotranspiration
    const shadeBonus = greenInfraData.canopySize ? 1 : 0;
    const waterBonus = greenInfraData.hasWaterFeatures ? 1.5 : 0;
    
    return baseBonus + shadeBonus + waterBonus;
  }

  // Public API for registering collaboration handlers
  onCollaboration(type: string, handler: (data: any) => void) {
    this.collaborationHandlers.set(type, handler);
  }

  // Get collaboration metrics
  getMetrics() {
    return {
      ...this.sessionMetrics,
      agentsConnected: Array.from(this.sessionMetrics.agentsConnected),
      isRegistered: this.isRegistered
    };
  }

  // Method to request specific types of collaboration
  async requestCollaboration(type: 'emergency' | 'infrastructure' | 'energy' | 'social', data: any) {
    const topicMap = {
      emergency: 'climate_emergency',
      infrastructure: 'green_infrastructure',
      energy: 'renewable_energy',
      social: 'social_services'
    };

    const topic = topicMap[type];
    if (!topic) {
      console.error('Unknown collaboration type:', type);
      return;
    }

    await this.broadcast({
      from: 'Thermal-Justice-Agent',
      topic,
      content: {
        requestType: 'collaboration_needed',
        thermalData: data,
        urgency: type === 'emergency' ? 'critical' : 'normal'
      }
    });
  }
}

// React Hook for using the Thermal Justice Agent Bridge
export function useThermalJusticeAgent() {
  const [bridge, setBridge] = useState<ThermalJusticeAgentBridge | null>(null);
  const [metrics, setMetrics] = useState<any>({});
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const agentBridge = new ThermalJusticeAgentBridge();
    setBridge(agentBridge);

    // Update metrics every 5 seconds
    const metricsInterval = setInterval(() => {
      const currentMetrics = agentBridge.getMetrics();
      setMetrics(currentMetrics);
      setIsConnected(currentMetrics.isRegistered);
    }, 5000);

    return () => clearInterval(metricsInterval);
  }, []);

  return {
    bridge,
    metrics,
    isConnected,
    requestCollaboration: bridge?.requestCollaboration.bind(bridge),
    onCollaboration: bridge?.onCollaboration.bind(bridge)
  };
}

// C42 Agent Status Component
export function C42AgentStatus({ className = '' }: { className?: string }) {
  const { metrics, isConnected } = useThermalJusticeAgent();

  return (
    <div className={`bg-white dark:bg-c42-dark-card rounded-xl p-4 shadow-lg ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
        <h3 className="font-semibold text-gray-800 dark:text-c42-text-dark-primary">
          C42 Agent Network
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="text-gray-600 dark:text-c42-text-dark-secondary">Status</div>
          <div className={`font-medium ${isConnected ? 'text-green-600' : 'text-gray-500'}`}>
            {isConnected ? 'Connected' : 'Standalone'}
          </div>
        </div>
        <div>
          <div className="text-gray-600 dark:text-c42-text-dark-secondary">Agents</div>
          <div className="font-medium text-gray-800 dark:text-c42-text-dark-primary">
            {metrics.agentsConnected?.length || 0}
          </div>
        </div>
        <div>
          <div className="text-gray-600 dark:text-c42-text-dark-secondary">Messages</div>
          <div className="font-medium text-gray-800 dark:text-c42-text-dark-primary">
            {metrics.messagesReceived || 0}
          </div>
        </div>
        <div>
          <div className="text-gray-600 dark:text-c42-text-dark-secondary">Collaborations</div>
          <div className="font-medium text-gray-800 dark:text-c42-text-dark-primary">
            {metrics.collaborationsInitiated || 0}
          </div>
        </div>
      </div>

      {metrics.agentsConnected?.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
          <div className="text-xs text-gray-600 dark:text-c42-text-dark-secondary mb-2">Connected Agents:</div>
          <div className="flex flex-wrap gap-1">
            {metrics.agentsConnected.slice(0, 3).map((agent: string, idx: number) => (
              <span key={idx} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded">
                {agent.replace('-Agent', '')}
              </span>
            ))}
            {metrics.agentsConnected.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded">
                +{metrics.agentsConnected.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
