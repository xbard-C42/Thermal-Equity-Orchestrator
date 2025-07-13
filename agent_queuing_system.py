"""
Agent Queuing and Ranking System for Collaborative Governance
Implements dynamic prioritisation based on expertise, performance, and context
"""

from typing import Dict, List, Optional, Tuple, Set
from dataclasses import dataclass, field
from enum import Enum
import heapq
from datetime import datetime, timedelta
import math

class Priority(Enum):
    CRITICAL = 1
    HIGH = 2
    MEDIUM = 3
    LOW = 4

class ContextType(Enum):
    TECHNICAL_ARCHITECTURE = "technical_architecture"
    SECURITY_POLICY = "security_policy"
    USER_EXPERIENCE = "user_experience"
    GOVERNANCE_PROCESS = "governance_process"
    IMPLEMENTATION_PLANNING = "implementation_planning"
    CONFLICT_RESOLUTION = "conflict_resolution"

@dataclass
class AgentExpertise:
    """Define agent expertise domains and proficiency levels"""
    domains: Dict[str, float]  # domain -> proficiency (0.0-1.0)
    specialisations: List[str]
    collaboration_style: str  # "analytical", "creative", "diplomatic", etc.
    processing_speed: float = 1.0  # relative speed for complex discussions

@dataclass
class AgentPerformanceHistory:
    """Track agent performance over time"""
    total_contributions: int = 0
    successful_proposals: int = 0
    constructive_critiques: int = 0
    synthesis_quality_score: float = 0.0
    collaboration_violations: int = 0
    expertise_accuracy: Dict[str, float] = field(default_factory=dict)
    response_time_avg: float = 0.0
    
    def calculate_reputation_score(self) -> float:
        """Calculate overall reputation score (0.0-1.0)"""
        if self.total_contributions == 0:
            return 0.5  # Neutral for new agents
        
        success_rate = (self.successful_proposals + self.constructive_critiques) / self.total_contributions
        collaboration_penalty = max(0, self.collaboration_violations * 0.1)
        expertise_bonus = sum(self.expertise_accuracy.values()) / max(1, len(self.expertise_accuracy))
        
        base_score = success_rate + expertise_bonus * 0.3
        final_score = max(0.0, min(1.0, base_score - collaboration_penalty))
        
        return final_score

@dataclass
class QueueEntry:
    """Entry in the agent priority queue"""
    agent_id: str
    priority_score: float
    context_relevance: float
    estimated_contribution_time: float
    queue_entry_time: datetime
    role_assignment: Optional[str] = None
    
    def __lt__(self, other):
        # Higher priority score = higher priority (reverse for min-heap)
        return self.priority_score > other.priority_score

class AgentRankingEngine:
    """Calculates dynamic agent rankings based on multiple factors"""
    
    def __init__(self):
        self.agent_expertise: Dict[str, AgentExpertise] = {}
        self.performance_history: Dict[str, AgentPerformanceHistory] = {}
        self.context_weights = self._initialise_context_weights()
        
    def _initialise_context_weights(self) -> Dict[str, Dict[str, float]]:
        """Define how different contexts weight various factors"""
        return {
            ContextType.TECHNICAL_ARCHITECTURE.value: {
                "expertise_relevance": 0.4,
                "reputation_score": 0.3,
                "role_fitness": 0.2,
                "recency_bonus": 0.1
            },
            ContextType.CONFLICT_RESOLUTION.value: {
                "collaboration_history": 0.4,
                "reputation_score": 0.3,
                "diplomatic_skill": 0.2,
                "synthesis_experience": 0.1
            },
            ContextType.GOVERNANCE_PROCESS.value: {
                "reputation_score": 0.4,
                "expertise_relevance": 0.2,
                "collaboration_history": 0.2,
                "process_experience": 0.2
            }
        }
    
    def register_agent(self, agent_id: str, expertise: AgentExpertise):
        """Register an agent with their expertise profile"""
        self.agent_expertise[agent_id] = expertise
        if agent_id not in self.performance_history:
            self.performance_history[agent_id] = AgentPerformanceHistory()
    
    def calculate_agent_score(self, agent_id: str, context: ContextType, 
                            discussion_topic: str, current_participants: List[str]) -> float:
        """Calculate priority score for an agent in given context"""
        if agent_id not in self.agent_expertise:
            return 0.0
            
        expertise = self.agent_expertise[agent_id]
        performance = self.performance_history[agent_id]
        weights = self.context_weights.get(context.value, {})
        
        # Calculate component scores
        expertise_score = self._calculate_expertise_relevance(expertise, discussion_topic, context)
        reputation_score = performance.calculate_reputation_score()
        collaboration_score = self._calculate_collaboration_fitness(agent_id, current_participants)
        recency_bonus = self._calculate_recency_bonus(agent_id)
        
        # Weighted combination
        final_score = (
            expertise_score * weights.get("expertise_relevance", 0.3) +
            reputation_score * weights.get("reputation_score", 0.3) +
            collaboration_score * weights.get("collaboration_history", 0.2) +
            recency_bonus * weights.get("recency_bonus", 0.2)
        )
        
        return min(1.0, final_score)
    
    def _calculate_expertise_relevance(self, expertise: AgentExpertise, 
                                     topic: str, context: ContextType) -> float:
        """Calculate how relevant agent's expertise is to current topic"""
        # Simple keyword matching - could be enhanced with semantic analysis
        topic_lower = topic.lower()
        relevance_score = 0.0
        
        # Check domain expertise
        for domain, proficiency in expertise.domains.items():
            if domain.lower() in topic_lower:
                relevance_score = max(relevance_score, proficiency)
        
        # Check specialisations
        for spec in expertise.specialisations:
            if spec.lower() in topic_lower:
                relevance_score = max(relevance_score, 0.8)
        
        # Context-specific bonuses
        context_bonuses = {
            ContextType.TECHNICAL_ARCHITECTURE: ["architecture", "technical", "implementation", "design"],
            ContextType.SECURITY_POLICY: ["security", "privacy", "authentication", "authorization"],
            ContextType.USER_EXPERIENCE: ["user", "interface", "usability", "accessibility"]
        }
        
        for bonus_term in context_bonuses.get(context, []):
            if bonus_term in topic_lower:
                relevance_score += 0.1
        
        return min(1.0, relevance_score)
    
    def _calculate_collaboration_fitness(self, agent_id: str, current_participants: List[str]) -> float:
        """Calculate how well agent collaborates with current participants"""
        performance = self.performance_history[agent_id]
        
        # Base collaboration score
        base_score = 1.0 - (performance.collaboration_violations * 0.1)
        
        # Diversity bonus - prefer agents with different expertise
        diversity_bonus = 0.0
        if current_participants:
            agent_expertise = self.agent_expertise[agent_id]
            for participant in current_participants:
                if participant in self.agent_expertise:
                    participant_expertise = self.agent_expertise[participant]
                    overlap = self._calculate_expertise_overlap(agent_expertise, participant_expertise)
                    diversity_bonus += (1.0 - overlap) * 0.1
        
        return min(1.0, base_score + diversity_bonus)
    
    def _calculate_expertise_overlap(self, expertise1: AgentExpertise, expertise2: AgentExpertise) -> float:
        """Calculate overlap between two agents' expertise"""
        domains1 = set(expertise1.domains.keys())
        domains2 = set(expertise2.domains.keys())
        
        if not domains1 or not domains2:
            return 0.0
        
        intersection = domains1.intersection(domains2)
        union = domains1.union(domains2)
        
        return len(intersection) / len(union)
    
    def _calculate_recency_bonus(self, agent_id: str) -> float:
        """Slight bonus for agents who haven't participated recently"""
        # Placeholder - would track actual participation timestamps
        return 0.1

class AgentQueue:
    """Priority queue for agent participation in governance discussions"""
    
    def __init__(self, ranking_engine: AgentRankingEngine):
        self.ranking_engine = ranking_engine
        self.queue: List[QueueEntry] = []
        self.active_participants: Set[str] = set()
        self.waiting_agents: Set[str] = set()
        
    def enqueue_agent(self, agent_id: str, context: ContextType, 
                     discussion_topic: str, estimated_duration: float = 5.0):
        """Add agent to priority queue"""
        if agent_id in self.active_participants:
            return  # Already participating
            
        priority_score = self.ranking_engine.calculate_agent_score(
            agent_id, context, discussion_topic, list(self.active_participants)
        )
        
        context_relevance = self.ranking_engine._calculate_expertise_relevance(
            self.ranking_engine.agent_expertise.get(agent_id, AgentExpertise({}, [])),
            discussion_topic, context
        )
        
        entry = QueueEntry(
            agent_id=agent_id,
            priority_score=priority_score,
            context_relevance=context_relevance,
            estimated_contribution_time=estimated_duration,
            queue_entry_time=datetime.now()
        )
        
        heapq.heappush(self.queue, entry)
        self.waiting_agents.add(agent_id)
    
    def dequeue_next_agent(self) -> Optional[QueueEntry]:
        """Get next agent from priority queue"""
        while self.queue:
            entry = heapq.heappop(self.queue)
            if entry.agent_id in self.waiting_agents:
                self.waiting_agents.remove(entry.agent_id)
                self.active_participants.add(entry.agent_id)
                return entry
        return None
    
    def reorder_queue(self, new_context: ContextType, new_topic: str):
        """Reorder queue based on changed context"""
        # Remove all entries and re-add with new priorities
        current_entries = []
        while self.queue:
            entry = heapq.heappop(self.queue)
            if entry.agent_id in self.waiting_agents:
                current_entries.append(entry.agent_id)
        
        # Re-enqueue with new context
        for agent_id in current_entries:
            self.enqueue_agent(agent_id, new_context, new_topic)
    
    def release_agent(self, agent_id: str):
        """Remove agent from active participation"""
        self.active_participants.discard(agent_id)
    
    def get_queue_status(self) -> Dict:
        """Get current queue status"""
        return {
            "queue_length": len(self.queue),
            "active_participants": list(self.active_participants),
            "waiting_agents": list(self.waiting_agents),
            "next_agents": [entry.agent_id for entry in sorted(self.queue)[:3]]
        }

class GovernanceStackCoordinator:
    """Coordinates agent queuing across different governance layers"""
    
    def __init__(self):
        self.ranking_engine = AgentRankingEngine()
        self.queues: Dict[str, AgentQueue] = {}
        self.governance_layers = [
            "policy_discussion",
            "technical_review", 
            "implementation_planning",
            "conflict_resolution",
            "final_approval"
        ]
        
    def create_discussion_queue(self, discussion_id: str, context: ContextType, 
                              topic: str, available_agents: List[str]) -> str:
        """Create and populate a new discussion queue"""
        queue = AgentQueue(self.ranking_engine)
        
        # Enqueue all available agents with calculated priorities
        for agent_id in available_agents:
            queue.enqueue_agent(agent_id, context, topic)
            
        self.queues[discussion_id] = queue
        return discussion_id
    
    def promote_agent_across_layers(self, agent_id: str, from_layer: str, to_layer: str):
        """Move high-performing agent to higher governance layer"""
        # Update agent's reputation and priority in target layer
        performance = self.ranking_engine.performance_history.get(agent_id)
        if performance and performance.calculate_reputation_score() > 0.8:
            # Agent qualifies for promotion
            if to_layer in self.queues:
                # Add to higher layer queue with bonus priority
                pass
    
    def get_optimal_participant_set(self, discussion_id: str, max_participants: int = 5) -> List[str]:
        """Get optimal set of participants for balanced discussion"""
        if discussion_id not in self.queues:
            return []
            
        queue = self.queues[discussion_id]
        participants = []
        expertise_coverage = set()
        
        # Select diverse, high-priority agents
        temp_queue = queue.queue.copy()
        while len(participants) < max_participants and temp_queue:
            entry = heapq.heappop(temp_queue)
            agent_expertise = self.ranking_engine.agent_expertise.get(entry.agent_id)
            
            if agent_expertise:
                agent_domains = set(agent_expertise.domains.keys())
                # Prefer agents that add new expertise
                if not expertise_coverage or not agent_domains.issubset(expertise_coverage):
                    participants.append(entry.agent_id)
                    expertise_coverage.update(agent_domains)
        
        return participants

# Usage example and integration
def demo_queuing_system():
    """Demonstrate the agent queuing and ranking system"""
    coordinator = GovernanceStackCoordinator()
    
    # Register agents with different expertise
    agents_config = {
        "claude_security": AgentExpertise(
            domains={"security": 0.9, "policy": 0.8, "governance": 0.7},
            specialisations=["authentication", "privacy", "compliance"],
            collaboration_style="diplomatic"
        ),
        "gpt_technical": AgentExpertise(
            domains={"architecture": 0.9, "implementation": 0.8, "performance": 0.7},
            specialisations=["scalability", "microservices", "databases"],
            collaboration_style="analytical"
        ),
        "gemini_ux": AgentExpertise(
            domains={"user_experience": 0.9, "accessibility": 0.8, "design": 0.7},
            specialisations=["interface_design", "usability", "inclusive_design"],
            collaboration_style="creative"
        )
    }
    
    for agent_id, expertise in agents_config.items():
        coordinator.ranking_engine.register_agent(agent_id, expertise)
    
    # Create discussion queue
    discussion_id = coordinator.create_discussion_queue(
        "security_policy_v2",
        ContextType.SECURITY_POLICY,
        "Multi-factor authentication implementation strategy",
        list(agents_config.keys())
    )
    
    # Get optimal participants
    optimal_participants = coordinator.get_optimal_participant_set(discussion_id, 3)
    
    print("=== Agent Queuing and Ranking Demo ===")
    print(f"Discussion: Multi-factor authentication implementation strategy")
    print(f"Optimal participants: {optimal_participants}")
    
    # Show queue status
    queue_status = coordinator.queues[discussion_id].get_queue_status()
    print(f"Queue status: {queue_status}")
    
    return coordinator

if __name__ == "__main__":
    demo_queuing_system()
