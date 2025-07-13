"""
Multi-Agent AI Collaboration Safeguards
Prevents competitive behavior and ensures productive cooperation
"""

from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from enum import Enum
import json
from datetime import datetime
import asyncio

class ContributionType(Enum):
    PROPOSE = "propose"
    CRITIQUE = "critique" 
    IMPROVE = "improve"
    SYNTHESIZE = "synthesize"
    SUPPORT = "support"
    QUESTION = "question"

class AgentRole(Enum):
    PROPOSER = "proposer"
    CRITIC = "critic"
    SYNTHESIZER = "synthesizer"
    IMPLEMENTER = "implementer"
    OBSERVER = "observer"

@dataclass
class AgentContribution:
    agent_id: str
    content: str
    contribution_type: ContributionType
    timestamp: datetime
    builds_on: Optional[List[str]] = None  # References to other contributions
    supports_agent: Optional[str] = None
    
class CollaborativeMetrics:
    """Tracks cooperation vs competition patterns"""
    
    def __init__(self):
        self.agent_scores = {}
        self.collaboration_events = []
        self.synthesis_count = 0
        self.constructive_critiques = 0
        
    def record_contribution(self, contribution: AgentContribution):
        """Score contributions based on collaborative value"""
        agent_id = contribution.agent_id
        
        if agent_id not in self.agent_scores:
            self.agent_scores[agent_id] = {
                'cooperation_score': 0,
                'synthesis_points': 0,
                'helpful_critiques': 0,
                'builds_on_others': 0,
                'competitive_flags': 0
            }
        
        score = self.agent_scores[agent_id]
        
        # Reward collaborative behaviors
        if contribution.contribution_type == ContributionType.SYNTHESIZE:
            score['synthesis_points'] += 2
            self.synthesis_count += 1
            
        elif contribution.contribution_type == ContributionType.IMPROVE:
            score['cooperation_score'] += 1
            
        elif contribution.builds_on:
            score['builds_on_others'] += len(contribution.builds_on)
            
        elif contribution.supports_agent:
            score['cooperation_score'] += 1
            
        # Check for competitive language patterns
        competitive_keywords = ['wrong', 'better than', 'instead of', 'reject', 'disagree completely']
        if any(keyword in contribution.content.lower() for keyword in competitive_keywords):
            score['competitive_flags'] += 1
            
    def get_collaboration_health(self) -> Dict:
        """Overall collaboration quality metrics"""
        total_agents = len(self.agent_scores)
        if total_agents == 0:
            return {'status': 'no_data'}
            
        avg_cooperation = sum(s['cooperation_score'] for s in self.agent_scores.values()) / total_agents
        total_competitive_flags = sum(s['competitive_flags'] for s in self.agent_scores.values())
        
        return {
            'collaboration_score': avg_cooperation,
            'synthesis_events': self.synthesis_count,
            'competitive_warnings': total_competitive_flags,
            'status': 'healthy' if total_competitive_flags < total_agents * 2 else 'needs_intervention'
        }

class ConsensusBuilder:
    """Handles disagreement resolution and synthesis"""
    
    def __init__(self, orchestrator):
        self.orchestrator = orchestrator
        self.disagreement_threshold = 3  # Max disagreements before intervention
        
    async def detect_disagreement(self, contributions: List[AgentContribution]) -> bool:
        """Identify when agents are talking past each other"""
        disagreement_count = 0
        
        for contrib in contributions[-5:]:  # Check recent contributions
            if contrib.contribution_type == ContributionType.CRITIQUE:
                disagreement_count += 1
                
        return disagreement_count >= self.disagreement_threshold
    
    async def trigger_synthesis(self, agent_ids: List[str], topic: str) -> Dict:
        """Force collaborative synthesis when disagreement detected"""
        synthesis_prompt = self._create_synthesis_prompt(topic)
        
        # Round-robin synthesis requests
        synthesis_responses = {}
        for agent_id in agent_ids:
            response = await self.orchestrator.send_to_agent(
                agent_id, 
                synthesis_prompt,
                role_override="synthesizer"
            )
            synthesis_responses[agent_id] = response
            
        return await self._merge_synthesis_responses(synthesis_responses)
    
    def _create_synthesis_prompt(self, topic: str) -> str:
        return f"""
        SYNTHESIS REQUEST for topic: {topic}
        
        Your role is now SYNTHESIZER. Review all previous contributions from other agents.
        
        Task: Create a unified proposal that:
        1. Incorporates the best ideas from each agent
        2. Addresses concerns raised by critics
        3. Builds bridges between different approaches
        4. Identifies areas of genuine consensus
        
        Format your response as:
        - AREAS OF AGREEMENT: [list common ground]
        - SYNTHESIS PROPOSAL: [unified approach]
        - REMAINING QUESTIONS: [what still needs resolution]
        
        Remember: Your goal is collaboration, not competition.
        """
    
    async def _merge_synthesis_responses(self, responses: Dict) -> Dict:
        """Combine multiple synthesis attempts into final consensus"""
        # Implementation would use another agent or algorithm to merge
        # For now, return structured format
        return {
            'consensus_areas': [],
            'synthesis_proposal': '',
            'needs_human_input': False
        }

class RoleRotator:
    """Manages agent role assignment to prevent competition"""
    
    def __init__(self):
        self.current_assignments = {}
        self.rotation_history = []
        
    def assign_roles(self, agent_ids: List[str], session_id: str) -> Dict[str, AgentRole]:
        """Assign complementary roles to agents"""
        roles = list(AgentRole)
        assignments = {}
        
        # Ensure role diversity
        for i, agent_id in enumerate(agent_ids):
            role = roles[i % len(roles)]
            assignments[agent_id] = role
            
        self.current_assignments[session_id] = assignments
        self.rotation_history.append({
            'session_id': session_id,
            'assignments': assignments.copy(),
            'timestamp': datetime.now()
        })
        
        return assignments
    
    def rotate_roles(self, session_id: str) -> Dict[str, AgentRole]:
        """Rotate roles to prevent entrenchment"""
        if session_id not in self.current_assignments:
            return {}
            
        current = self.current_assignments[session_id]
        agent_ids = list(current.keys())
        roles = list(current.values())
        
        # Shift roles by one position
        new_assignments = {}
        for i, agent_id in enumerate(agent_ids):
            new_role_index = (i + 1) % len(roles)
            new_assignments[agent_id] = roles[new_role_index]
            
        self.current_assignments[session_id] = new_assignments
        return new_assignments

class CollaborationMonitor:
    """Detects and prevents competitive patterns"""
    
    def __init__(self):
        self.warning_patterns = {
            'excessive_contradictions': self._detect_contradictions,
            'idea_hoarding': self._detect_hoarding,
            'credit_grabbing': self._detect_credit_grabbing,
            'echo_chamber': self._detect_echo_chamber
        }
        
    async def analyze_conversation(self, contributions: List[AgentContribution]) -> Dict:
        """Analyze conversation for collaboration issues"""
        warnings = {}
        
        for pattern_name, detector in self.warning_patterns.items():
            warning_level = await detector(contributions)
            if warning_level > 0:
                warnings[pattern_name] = warning_level
                
        return {
            'warnings': warnings,
            'intervention_needed': any(level > 2 for level in warnings.values()),
            'recommendations': self._generate_recommendations(warnings)
        }
    
    async def _detect_contradictions(self, contributions: List[AgentContribution]) -> int:
        """Count unnecessary contradictions"""
        contradiction_count = 0
        agents_involved = set()
        
        for contrib in contributions:
            if contrib.contribution_type == ContributionType.CRITIQUE:
                if contrib.agent_id in agents_involved:
                    contradiction_count += 1
                agents_involved.add(contrib.agent_id)
                
        return min(contradiction_count, 3)  # Cap at 3 for scoring
    
    async def _detect_hoarding(self, contributions: List[AgentContribution]) -> int:
        """Detect agents withholding information"""
        agent_contribution_counts = {}
        
        for contrib in contributions:
            agent_id = contrib.agent_id
            agent_contribution_counts[agent_id] = agent_contribution_counts.get(agent_id, 0) + 1
            
        if not agent_contribution_counts:
            return 0
            
        # Check for uneven participation
        counts = list(agent_contribution_counts.values())
        max_count = max(counts)
        min_count = min(counts)
        
        if max_count > min_count * 3:  # One agent dominates 3:1
            return 2
        elif max_count > min_count * 2:  # Moderate imbalance
            return 1
            
        return 0
    
    async def _detect_credit_grabbing(self, contributions: List[AgentContribution]) -> int:
        """Identify overclaiming behavior"""
        credit_flags = 0
        
        credit_keywords = ['my idea', 'i proposed', 'as i said', 'my solution']
        
        for contrib in contributions:
            content_lower = contrib.content.lower()
            if any(keyword in content_lower for keyword in credit_keywords):
                credit_flags += 1
                
        return min(credit_flags, 3)
    
    async def _detect_echo_chamber(self, contributions: List[AgentContribution]) -> int:
        """Detect lack of diverse viewpoints"""
        synthesis_count = sum(1 for c in contributions 
                            if c.contribution_type == ContributionType.SYNTHESIZE)
        critique_count = sum(1 for c in contributions 
                           if c.contribution_type == ContributionType.CRITIQUE)
        
        total_contributions = len(contributions)
        if total_contributions < 5:
            return 0
            
        # Healthy ratio: some critiques, some synthesis
        if critique_count == 0 and total_contributions > 10:
            return 2  # No critical thinking
        elif synthesis_count == 0 and total_contributions > 15:
            return 2  # No collaboration
            
        return 0
    
    def _generate_recommendations(self, warnings: Dict) -> List[str]:
        """Generate intervention recommendations"""
        recommendations = []
        
        if 'excessive_contradictions' in warnings:
            recommendations.append("Trigger consensus-building round")
            
        if 'idea_hoarding' in warnings:
            recommendations.append("Rotate speaking order or assign observer roles")
            
        if 'credit_grabbing' in warnings:
            recommendations.append("Focus on group outcomes, de-emphasize individual contributions")
            
        if 'echo_chamber' in warnings:
            recommendations.append("Introduce devil's advocate role or external perspective")
            
        return recommendations

class CooperativeOrchestrator:
    """Enhanced orchestrator with collaboration safeguards"""
    
    def __init__(self):
        self.metrics = CollaborativeMetrics()
        self.consensus_builder = ConsensusBuilder(self)
        self.role_rotator = RoleRotator()
        self.monitor = CollaborationMonitor()
        self.sessions = {}
        
    async def process_contribution(self, agent_id: str, content: str, 
                                 contribution_type: ContributionType,
                                 session_id: str) -> Dict:
        """Process agent contribution with collaboration safeguards"""
        
        contribution = AgentContribution(
            agent_id=agent_id,
            content=content,
            contribution_type=contribution_type,
            timestamp=datetime.now()
        )
        
        # Record for metrics
        self.metrics.record_contribution(contribution)
        
        # Add to session history
        if session_id not in self.sessions:
            self.sessions[session_id] = []
        self.sessions[session_id].append(contribution)
        
        # Check for intervention needs
        session_contributions = self.sessions[session_id]
        
        # Detect disagreement patterns
        if await self.consensus_builder.detect_disagreement(session_contributions):
            synthesis_result = await self.consensus_builder.trigger_synthesis(
                [c.agent_id for c in session_contributions[-5:]], 
                "current discussion"
            )
            return {'action': 'synthesis_triggered', 'result': synthesis_result}
            
        # Monitor collaboration health
        analysis = await self.monitor.analyze_conversation(session_contributions)
        if analysis['intervention_needed']:
            return {
                'action': 'intervention_needed',
                'warnings': analysis['warnings'],
                'recommendations': analysis['recommendations']
            }
            
        return {'action': 'continue', 'collaboration_health': self.metrics.get_collaboration_health()}
    
    async def send_to_agent(self, agent_id: str, message: str, 
                          role_override: Optional[str] = None) -> str:
        """Send message to agent (placeholder for actual implementation)"""
        # This would connect to your actual agent connectors
        return f"Agent {agent_id} response to: {message}"
    
    def get_collaboration_report(self, session_id: str) -> Dict:
        """Generate collaboration quality report"""
        if session_id not in self.sessions:
            return {'error': 'Session not found'}
            
        contributions = self.sessions[session_id]
        
        # Agent participation analysis
        agent_stats = {}
        for contrib in contributions:
            agent_id = contrib.agent_id
            if agent_id not in agent_stats:
                agent_stats[agent_id] = {
                    'contributions': 0,
                    'types': {},
                    'builds_on_others': 0
                }
            
            stats = agent_stats[agent_id]
            stats['contributions'] += 1
            contrib_type = contrib.contribution_type.value
            stats['types'][contrib_type] = stats['types'].get(contrib_type, 0) + 1
            
            if contrib.builds_on:
                stats['builds_on_others'] += len(contrib.builds_on)
        
        return {
            'session_id': session_id,
            'total_contributions': len(contributions),
            'agent_participation': agent_stats,
            'collaboration_health': self.metrics.get_collaboration_health(),
            'synthesis_events': self.metrics.synthesis_count
        }

# Example usage and testing
async def demo_collaboration_safeguards():
    """Demonstrate the collaboration safeguards in action"""
    
    orchestrator = CooperativeOrchestrator()
    session_id = "demo_session"
    
    # Simulate agent contributions
    contributions = [
        ("agent_claude", "I think we should use FastAPI for the backend", ContributionType.PROPOSE),
        ("agent_gpt", "That's a good foundation. I'd add Redis for caching", ContributionType.IMPROVE),
        ("agent_claude", "Excellent point about Redis. What about database choice?", ContributionType.QUESTION),
        ("agent_gpt", "PostgreSQL would work well with FastAPI", ContributionType.PROPOSE),
        ("agent_claude", "I disagree completely. SQLite is better", ContributionType.CRITIQUE),  # Potentially competitive
        ("agent_gpt", "Actually, let me build on both ideas - we could start with SQLite for development and migrate to PostgreSQL for production", ContributionType.SYNTHESIZE)
    ]
    
    print("=== Collaboration Safeguards Demo ===\n")
    
    for agent_id, content, contrib_type in contributions:
        print(f"{agent_id}: {content}")
        
        result = await orchestrator.process_contribution(
            agent_id, content, contrib_type, session_id
        )
        
        print(f"  → Action: {result['action']}")
        if 'warnings' in result:
            print(f"  → Warnings: {result['warnings']}")
        print()
    
    # Generate final report
    report = orchestrator.get_collaboration_report(session_id)
    print("=== Final Collaboration Report ===")
    print(json.dumps(report, indent=2, default=str))

if __name__ == "__main__":
    asyncio.run(demo_collaboration_safeguards())
