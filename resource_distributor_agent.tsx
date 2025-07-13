// 🌊 C42 Resource Distributor Agent
// ====================================
// Converts consciousness coordination principles into resource stewardship
// Integrates with existing C42 agent bridge for seamless collaboration

import { C42SDKv3, AgentMessage } from './c42-sdk-agent-bridge';

// 📊 Core Data Types
interface DonorProfile {
  id: string;
  wallet: number;
  preferences: Record<string, number>; // causeId -> weight (0-1)
  allocationBudget: number;
  lastActivity: number;
  trustLevel: number;
}

interface CauseProfile {
  id: string;
  name: string;
  need: number;
  priority: number; // 0-1, higher = more urgent
  received: number;
  totalReceived: number;
  lastUpdate: number;
}

interface AllocationEvent {
  timestamp: number;
  donorId: string;
  causeId: string;
  amount: number;
  confidence: number;
  reasoning: string;
}

interface CouncilDecision {
  councilId: string;
  topic: string;
  participants: string[];
  decision: any;
  confidence: number;
  timestamp: number;
}

// 🎯 Main Resource Distributor Agent
export class ResourceDistributorAgent {
  readonly id = 'Distributor-Agent';
  readonly capabilities = [
    'allocate_resources',
    'track_flows', 
    'coordinate_donors',
    'convene_councils',
    'analyze_patterns',
    'generate_insights'
  ];

  private sdk: C42SDKv3;
  private donors = new Map<string, DonorProfile>();
  private causes = new Map<string, CauseProfile>();
  private allocationHistory: AllocationEvent[] = [];
  private councilDecisions: CouncilDecision[] = [];
  private isProcessing = false;
  private config = {
    maxAllocationPerCycle: 1000,
    minTrustLevel: 30,
    councilThreshold: 0.7, // trigger council if confidence < 70%
    auditRetentionDays: 90
  };

  constructor(sdk: C42SDKv3) {
    this.sdk = sdk;
    this.initialize();
  }

  // 🚀 Agent Initialization
  private async initialize(): Promise<void> {
    console.log('🌊 ResourceDistributorAgent initializing...');
    
    // Register with C42 bridge
    this.sdk.agent.register(this.id, this.capabilities);
    
    // Subscribe to relevant message patterns
    this.subscribeToMessages();
    
    // Start periodic processing
    this.startProcessingLoop();
    
    // Announce readiness
    await this.sdk.agent.broadcast({
      from: this.id,
      topic: 'agent:ready',
      content: {
        capabilities: this.capabilities,
        message: 'ResourceDistributorAgent ready to coordinate resource flows'
      }
    });

    console.log('✅ ResourceDistributorAgent initialized successfully');
  }

  // 📡 Message Subscription Setup
  private subscribeToMessages(): void {
    // Donor capacity offers
    this.sdk.agent.subscribe('offer_capacity', (msg) => this.handleCapacityOffer(msg));
    
    // Cause funding needs
    this.sdk.agent.subscribe('register_need', (msg) => this.handleNeedRegistration(msg));
    
    // Preference updates
    this.sdk.agent.subscribe('preference_update', (msg) => this.handlePreferenceUpdate(msg));
    
    // Council invitations and responses
    this.sdk.agent.subscribe('council:*', (msg) => this.handleCouncilMessage(msg));
    
    // Agent collaboration requests
    this.sdk.agent.subscribe('collaboration_request', (msg) => this.handleCollaborationRequest(msg));
    
    // Audit and transparency requests
    this.sdk.agent.subscribe('audit_request', (msg) => this.handleAuditRequest(msg));
  }

  // 💰 Handle Donor Capacity Offers
  private async handleCapacityOffer(msg: AgentMessage): Promise<void> {
    const { donorId, wallet, allocationPercentage = 0.1, preferences = {} } = msg.content;
    
    console.log(`💰 Capacity offer from ${donorId}: ${wallet} tokens`);
    
    // Update or create donor profile
    const donor: DonorProfile = this.donors.get(donorId) || {
      id: donorId,
      wallet: 0,
      preferences: {},
      allocationBudget: 0,
      lastActivity: 0,
      trustLevel: 50
    };
    
    donor.wallet = wallet;
    donor.preferences = { ...donor.preferences, ...preferences };
    donor.allocationBudget = wallet * allocationPercentage;
    donor.lastActivity = Date.now();
    
    this.donors.set(donorId, donor);
    
    // Trigger allocation evaluation
    await this.evaluateAllocations();
    
    // Acknowledge to donor
    await this.sdk.agent.whisper(donorId, {
      topic: 'capacity_acknowledged',
      content: {
        budget: donor.allocationBudget,
        message: 'Your capacity has been registered and will be allocated according to your preferences'
      }
    });
  }

  // 🎯 Handle Cause Need Registration
  private async handleNeedRegistration(msg: AgentMessage): Promise<void> {
    const { causeId, name, need, priority = 0.5, description } = msg.content;
    
    console.log(`🎯 Need registration from ${causeId}: ${need} tokens needed`);
    
    // Update or create cause profile
    const cause: CauseProfile = this.causes.get(causeId) || {
      id: causeId,
      name: name || causeId,
      need: 0,
      priority: 0.5,
      received: 0,
      totalReceived: 0,
      lastUpdate: 0
    };
    
    cause.need = need;
    cause.priority = Math.max(0, Math.min(1, priority));
    cause.lastUpdate = Date.now();
    
    this.causes.set(causeId, cause);
    
    // Trigger allocation evaluation
    await this.evaluateAllocations();
    
    // Acknowledge to cause
    await this.sdk.agent.whisper(causeId, {
      topic: 'need_acknowledged',
      content: {
        need: cause.need,
        priority: cause.priority,
        message: 'Your funding need has been registered and will be matched with available resources'
      }
    });
  }

  // 🎛️ Handle Preference Updates
  private async handlePreferenceUpdate(msg: AgentMessage): Promise<void> {
    const { donorId, preferences, reason } = msg.content;
    
    const donor = this.donors.get(donorId);
    if (!donor) return;
    
    console.log(`🎛️ Preference update from ${donorId}:`, preferences);
    
    donor.preferences = { ...donor.preferences, ...preferences };
    donor.lastActivity = Date.now();
    
    // Trigger reallocation
    await this.evaluateAllocations();
    
    // Log preference change for transparency
    await this.sdk.agent.broadcast({
      from: this.id,
      topic: 'preference_change',
      content: {
        donorId,
        newPreferences: preferences,
        reason: reason || 'Preference update',
        timestamp: Date.now()
      }
    });
  }

  // 🧠 Core Allocation Logic (from Python sim)
  private async evaluateAllocations(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;
    
    try {
      console.log('🧠 Evaluating allocations...');
      
      const allocations = this.calculateAllocations();
      const confidence = this.calculateConfidence(allocations);
      
      // If confidence is low, convene a council
      if (confidence < this.config.councilThreshold) {
        await this.conveneResourceCouncil(allocations, confidence);
        return;
      }
      
      // Execute allocations
      await this.executeAllocations(allocations);
      
    } catch (error) {
      console.error('❌ Error in allocation evaluation:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  // 📊 Calculate Optimal Allocations
  private calculateAllocations(): Record<string, Record<string, number>> {
    const allocations: Record<string, Record<string, number>> = {};
    
    // Iterate through each donor
    this.donors.forEach((donor, donorId) => {
      if (donor.allocationBudget <= 0) return;
      
      allocations[donorId] = {};
      
      // Find causes this donor cares about
      const relevantCauses = Array.from(this.causes.values()).filter(cause => 
        donor.preferences[cause.id] && donor.preferences[cause.id] > 0
      );
      
      if (relevantCauses.length === 0) return;
      
      // Calculate total weighted priority
      const totalWeightedPriority = relevantCauses.reduce((sum, cause) => {
        const preferenceWeight = donor.preferences[cause.id] || 0;
        const priorityWeight = cause.priority;
        const needWeight = Math.min(cause.need, donor.allocationBudget);
        return sum + (preferenceWeight * priorityWeight * needWeight);
      }, 0);
      
      if (totalWeightedPriority <= 0) return;
      
      // Allocate proportionally
      relevantCauses.forEach(cause => {
        const preferenceWeight = donor.preferences[cause.id] || 0;
        const priorityWeight = cause.priority;
        const needWeight = Math.min(cause.need, donor.allocationBudget);
        
        const weightedScore = preferenceWeight * priorityWeight * needWeight;
        const proportion = weightedScore / totalWeightedPriority;
        
        let allocation = donor.allocationBudget * proportion;
        
        // Don't allocate more than the cause actually needs
        allocation = Math.min(allocation, cause.need - cause.received);
        
        if (allocation > 0) {
          allocations[donorId][cause.id] = allocation;
        }
      });
    });
    
    return allocations;
  }

  // 🎯 Calculate Allocation Confidence
  private calculateConfidence(allocations: Record<string, Record<string, number>>): number {
    let totalNeed = 0;
    let totalMet = 0;
    
    this.causes.forEach(cause => {
      totalNeed += cause.need;
      
      // Calculate how much this cause would receive
      const causeReceived = Object.values(allocations).reduce((sum, donorAllocations) => {
        return sum + (donorAllocations[cause.id] || 0);
      }, 0);
      
      totalMet += Math.min(causeReceived, cause.need);
    });
    
    return totalNeed > 0 ? totalMet / totalNeed : 1.0;
  }

  // 🏛️ Convene Resource Allocation Council
  private async conveneResourceCouncil(allocations: any, confidence: number): Promise<void> {
    console.log(`🏛️ Convening council - confidence: ${confidence.toFixed(2)}`);
    
    const councilId = await this.sdk.agent.convene('resource_allocation_review');
    
    // Share allocation context with council
    await this.sdk.agent.broadcast({
      from: this.id,
      topic: 'council:resource_context',
      content: {
        councilId,
        allocations,
        confidence,
        donors: Array.from(this.donors.values()),
        causes: Array.from(this.causes.values()),
        question: 'Should we proceed with these allocations or modify the approach?'
      }
    });
  }

  // 🏛️ Handle Council Messages
  private async handleCouncilMessage(msg: AgentMessage): Promise<void> {
    if (msg.topic === 'council:decision' && msg.content.councilId) {
      const decision: CouncilDecision = {
        councilId: msg.content.councilId,
        topic: msg.content.topic,
        participants: msg.content.participants || [],
        decision: msg.content.decision,
        confidence: msg.content.confidence || 0,
        timestamp: Date.now()
      };
      
      this.councilDecisions.push(decision);
      
      // Act on council decision
      if (decision.decision.approve) {
        await this.executeAllocations(decision.decision.allocations);
      } else {
        console.log('Council advised against current allocation - pausing');
      }
    }
  }

  // ⚡ Execute Allocations
  private async executeAllocations(allocations: Record<string, Record<string, number>>): Promise<void> {
    const executedAllocations: AllocationEvent[] = [];
    
    // Process each donor's allocations
    for (const [donorId, donorAllocations] of Object.entries(allocations)) {
      const donor = this.donors.get(donorId);
      if (!donor) continue;
      
      for (const [causeId, amount] of Object.entries(donorAllocations)) {
        const cause = this.causes.get(causeId);
        if (!cause || amount <= 0) continue;
        
        // Execute the allocation
        donor.wallet -= amount;
        donor.allocationBudget -= amount;
        cause.received += amount;
        cause.totalReceived += amount;
        
        // Record the event
        const event: AllocationEvent = {
          timestamp: Date.now(),
          donorId,
          causeId,
          amount,
          confidence: this.calculateConfidence(allocations),
          reasoning: `Allocated based on preference (${donor.preferences[causeId]?.toFixed(2)}) and priority (${cause.priority.toFixed(2)})`
        };
        
        executedAllocations.push(event);
        this.allocationHistory.push(event);
        
        // Notify donor
        await this.sdk.agent.whisper(donorId, {
          topic: 'allocation_executed',
          content: {
            causeId,
            causeName: cause.name,
            amount,
            remainingWallet: donor.wallet,
            reasoning: event.reasoning
          }
        });
        
        // Notify cause
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
    
    // Reset cause received amounts for next cycle
    this.causes.forEach(cause => {
      cause.received = 0;
    });
    
    // Broadcast allocation summary
    await this.sdk.agent.broadcast({
      from: this.id,
      topic: 'allocation_summary',
      content: {
        totalAllocated: executedAllocations.reduce((sum, event) => sum + event.amount, 0),
        allocationCount: executedAllocations.length,
        donorsParticipated: new Set(executedAllocations.map(e => e.donorId)).size,
        causesSupported: new Set(executedAllocations.map(e => e.causeId)).size,
        averageConfidence: executedAllocations.reduce((sum, e) => sum + e.confidence, 0) / executedAllocations.length,
        timestamp: Date.now()
      }
    });
    
    console.log(`✅ Executed ${executedAllocations.length} allocations`);
  }

  // 📊 Handle Audit Requests
  private async handleAuditRequest(msg: AgentMessage): Promise<void> {
    const { requestType, timeRange, donorId, causeId } = msg.content;
    
    let auditData: any = {};
    
    switch (requestType) {
      case 'full_history':
        auditData = {
          allocationHistory: this.allocationHistory,
          totalAllocated: this.allocationHistory.reduce((sum, event) => sum + event.amount, 0),
          uniqueDonors: new Set(this.allocationHistory.map(e => e.donorId)).size,
          uniqueCauses: new Set(this.allocationHistory.map(e => e.causeId)).size
        };
        break;
        
      case 'donor_activity':
        auditData = {
          donorProfile: this.donors.get(donorId),
          allocations: this.allocationHistory.filter(e => e.donorId === donorId),
          totalGiven: this.allocationHistory
            .filter(e => e.donorId === donorId)
            .reduce((sum, e) => sum + e.amount, 0)
        };
        break;
        
      case 'cause_funding':
        auditData = {
          causeProfile: this.causes.get(causeId),
          allocations: this.allocationHistory.filter(e => e.causeId === causeId),
          totalReceived: this.allocationHistory
            .filter(e => e.causeId === causeId)
            .reduce((sum, e) => sum + e.amount, 0)
        };
        break;
    }
    
    // Send audit response
    await this.sdk.agent.whisper(msg.from, {
      topic: 'audit_response',
      content: {
        requestType,
        data: auditData,
        timestamp: Date.now(),
        hash: this.generateHash(JSON.stringify(auditData))
      }
    });
  }

  // 🤝 Handle Collaboration Requests
  private async handleCollaborationRequest(msg: AgentMessage): Promise<void> {
    const { requestType, data } = msg.content;
    
    switch (requestType) {
      case 'get_patterns':
        const patterns = this.analyzePatterns();
        await this.sdk.agent.whisper(msg.from, {
          topic: 'pattern_analysis',
          content: patterns
        });
        break;
        
      case 'suggest_causes':
        const suggestions = this.suggestCauses(data.donorProfile);
        await this.sdk.agent.whisper(msg.from, {
          topic: 'cause_suggestions',
          content: suggestions
        });
        break;
    }
  }

  // 📈 Pattern Analysis
  private analyzePatterns(): any {
    const patterns = {
      topCauses: this.getTopCauses(),
      donorClusters: this.getDonorClusters(),
      allocationTrends: this.getAllocationTrends(),
      efficiency: this.calculateEfficiency()
    };
    
    return patterns;
  }

  // 🎯 Suggest Causes Based on Donor Profile
  private suggestCauses(donorProfile: any): any {
    // Find similar donors and their preferred causes
    const similarDonors = this.findSimilarDonors(donorProfile);
    const suggestedCauses = new Map<string, number>();
    
    similarDonors.forEach(donor => {
      Object.entries(donor.preferences).forEach(([causeId, weight]) => {
        if (!donorProfile.preferences[causeId]) {
          suggestedCauses.set(causeId, (suggestedCauses.get(causeId) || 0) + weight);
        }
      });
    });
    
    return Array.from(suggestedCauses.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([causeId, score]) => ({
        causeId,
        cause: this.causes.get(causeId),
        score,
        reason: 'Similar donors support this cause'
      }));
  }

  // 🔍 Helper Methods
  private getTopCauses(): any[] {
    return Array.from(this.causes.values())
      .sort((a, b) => b.totalReceived - a.totalReceived)
      .slice(0, 10);
  }

  private getDonorClusters(): any {
    // Simple clustering based on preference similarity
    const clusters = new Map<string, DonorProfile[]>();
    
    this.donors.forEach(donor => {
      const primaryCause = Object.entries(donor.preferences)
        .sort((a, b) => b[1] - a[1])[0]?.[0];
      
      if (primaryCause) {
        if (!clusters.has(primaryCause)) {
          clusters.set(primaryCause, []);
        }
        clusters.get(primaryCause)!.push(donor);
      }
    });
    
    return Object.fromEntries(clusters);
  }

  private getAllocationTrends(): any {
    const last30Days = this.allocationHistory.filter(
      event => event.timestamp > Date.now() - 30 * 24 * 60 * 60 * 1000
    );
    
    return {
      totalAllocated: last30Days.reduce((sum, e) => sum + e.amount, 0),
      averagePerDay: last30Days.length > 0 ? 
        last30Days.reduce((sum, e) => sum + e.amount, 0) / 30 : 0,
      trendDirection: this.calculateTrendDirection(last30Days)
    };
  }

  private calculateEfficiency(): number {
    const totalOffered = Array.from(this.donors.values())
      .reduce((sum, donor) => sum + donor.allocationBudget, 0);
    const totalAllocated = this.allocationHistory
      .reduce((sum, event) => sum + event.amount, 0);
    
    return totalOffered > 0 ? totalAllocated / totalOffered : 0;
  }

  private findSimilarDonors(profile: any): DonorProfile[] {
    return Array.from(this.donors.values())
      .filter(donor => this.calculateSimilarity(donor.preferences, profile.preferences) > 0.5)
      .slice(0, 10);
  }

  private calculateSimilarity(prefs1: Record<string, number>, prefs2: Record<string, number>): number {
    const allCauses = new Set([...Object.keys(prefs1), ...Object.keys(prefs2)]);
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;
    
    allCauses.forEach(cause => {
      const w1 = prefs1[cause] || 0;
      const w2 = prefs2[cause] || 0;
      dotProduct += w1 * w2;
      norm1 += w1 * w1;
      norm2 += w2 * w2;
    });
    
    return norm1 * norm2 > 0 ? dotProduct / Math.sqrt(norm1 * norm2) : 0;
  }

  private calculateTrendDirection(events: AllocationEvent[]): 'up' | 'down' | 'stable' {
    if (events.length < 2) return 'stable';
    
    const firstHalf = events.slice(0, Math.floor(events.length / 2));
    const secondHalf = events.slice(Math.floor(events.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, e) => sum + e.amount, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, e) => sum + e.amount, 0) / secondHalf.length;
    
    const change = (secondAvg - firstAvg) / firstAvg;
    
    if (change > 0.1) return 'up';
    if (change < -0.1) return 'down';
    return 'stable';
  }

  private generateHash(data: string): string {
    return data.split('').reduce((hash, char) => {
      return ((hash << 5) - hash) + char.charCodeAt(0) | 0;
    }, 0).toString(16);
  }

  // 🔄 Processing Loop
  private startProcessingLoop(): void {
    setInterval(() => {
      // Periodic cleanup and maintenance
      this.cleanupOldData();
      this.updateTrustLevels();
    }, 60000); // Every minute
  }

  private cleanupOldData(): void {
    const cutoff = Date.now() - (this.config.auditRetentionDays * 24 * 60 * 60 * 1000);
    this.allocationHistory = this.allocationHistory.filter(event => event.timestamp > cutoff);
  }

  private updateTrustLevels(): void {
    this.donors.forEach(donor => {
      const recentActivity = Date.now() - donor.lastActivity;
      const daysSinceActivity = recentActivity / (24 * 60 * 60 * 1000);
      
      // Increase trust for active donors
      if (daysSinceActivity < 7) {
        donor.trustLevel = Math.min(100, donor.trustLevel + 1);
      } else if (daysSinceActivity > 30) {
        donor.trustLevel = Math.max(0, donor.trustLevel - 1);
      }
    });
  }

  // 📊 Public Methods for UI Integration
  public getDashboardData(): any {
    return {
      activeDonors: this.donors.size,
      activeCauses: this.causes.size,
      totalAllocated: this.allocationHistory.reduce((sum, e) => sum + e.amount, 0),
      recentAllocations: this.allocationHistory.slice(-10),
      topCauses: this.getTopCauses().slice(0, 5),
      allocationTrends: this.getAllocationTrends(),
      councilDecisions: this.councilDecisions.slice(-5)
    };
  }

  public getAgentStatus(): any {
    return {
      id: this.id,
      status: this.isProcessing ? 'processing' : 'ready',
      capabilities: this.capabilities,
      donors: this.donors.size,
      causes: this.causes.size,
      lastActivity: Math.max(
        ...Array.from(this.donors.values()).map(d => d.lastActivity),
        ...Array.from(this.causes.values()).map(c => c.lastUpdate)
      ),
      confidence: this.calculateConfidence(this.calculateAllocations())
    };
  }
}

// 🎨 UI Integration Helper
export class ResourceDistributorUI {
  private agent: ResourceDistributorAgent;
  
  constructor(agent: ResourceDistributorAgent) {
    this.agent = agent;
  }
  
  // This would integrate with your existing UI components
  public createDashboardCard(): any {
    const data = this.agent.getDashboardData();
    
    return {
      title: 'Resource Flows',
      type: 'resource_distributor',
      data,
      actions: [
        { id: 'view_allocations', label: 'View Allocations' },
        { id: 'run_audit', label: 'Run Audit' },
        { id: 'analyze_patterns', label: 'Analyze Patterns' }
      ]
    };
  }
}

// 🚀 Export for Integration
export default ResourceDistributorAgent;