"""
Collaborative Council Plugin Integration
Production-ready integration for MessageOrchestrator and C42 OS
"""

import asyncio
import json
from abc import ABC, abstractmethod
from typing import Dict, List, Optional, Any, Callable
from dataclasses import dataclass, asdict
from enum import Enum
import logging
from datetime import datetime
import aiohttp
import os

# Import our collaborative modules
from collaborative_safeguards import CooperativeOrchestrator, ContributionType
from collaborative_prompts import CollaborativePromptLibrary, AgentRole

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class LLMProvider(Enum):
    OPENAI = "openai"
    ANTHROPIC = "anthropic" 
    GOOGLE = "google"
    CUSTOM = "custom"

@dataclass
class AgentConfig:
    """Configuration for a real LLM agent"""
    agent_id: str
    provider: LLMProvider
    model: str
    api_key: str
    max_tokens: int = 1000
    temperature: float = 0.7
    personality_traits: Dict[str, float] = None
    specialized_domains: List[str] = None

@dataclass
class CouncilConfig:
    """Configuration for a collaborative council"""
    council_id: str
    name: str
    description: str
    agents: List[AgentConfig]
    default_roles: Dict[str, AgentRole] = None
    intervention_thresholds: Dict[str, float] = None
    domain_specific_prompts: Dict[str, str] = None

class LLMAgent:
    """Real LLM agent that interfaces with actual APIs"""
    
    def __init__(self, config: AgentConfig):
        self.config = config
        self.current_role: Optional[AgentRole] = None
        self.system_prompt = ""
        self.conversation_context = []
        
    async def assign_role(self, role: AgentRole, system_prompt: str):
        """Assign role and system prompt to agent"""
        self.current_role = role
        self.system_prompt = system_prompt
        logger.info(f"Agent {self.config.agent_id} assigned role: {role.value}")
        
    async def generate_response(self, user_message: str, context: List[Dict] = None) -> str:
        """Generate response using the configured LLM provider"""
        try:
            if self.config.provider == LLMProvider.OPENAI:
                return await self._call_openai(user_message, context)
            elif self.config.provider == LLMProvider.ANTHROPIC:
                return await self._call_anthropic(user_message, context)
            elif self.config.provider == LLMProvider.GOOGLE:
                return await self._call_google(user_message, context)
            else:
                return await self._call_custom(user_message, context)
                
        except Exception as e:
            logger.error(f"Error generating response for {self.config.agent_id}: {e}")
            return f"I'm experiencing technical difficulties. Please try again."
    
    async def _call_openai(self, message: str, context: List[Dict] = None) -> str:
        """Call OpenAI API"""
        headers = {
            "Authorization": f"Bearer {self.config.api_key}",
            "Content-Type": "application/json"
        }
        
        messages = [{"role": "system", "content": self.system_prompt}]
        
        # Add conversation context
        if context:
            messages.extend(context[-5:])  # Last 5 messages for context
            
        messages.append({"role": "user", "content": message})
        
        payload = {
            "model": self.config.model,
            "messages": messages,
            "max_tokens": self.config.max_tokens,
            "temperature": self.config.temperature
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(
                "https://api.openai.com/v1/chat/completions",
                headers=headers,
                json=payload
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    return data["choices"][0]["message"]["content"]
                else:
                    logger.error(f"OpenAI API error: {response.status}")
                    return "API call failed"
    
    async def _call_anthropic(self, message: str, context: List[Dict] = None) -> str:
        """Call Anthropic API"""
        headers = {
            "x-api-key": self.config.api_key,
            "Content-Type": "application/json",
            "anthropic-version": "2023-06-01"
        }
        
        # Build context string
        context_str = ""
        if context:
            for msg in context[-5:]:
                context_str += f"{msg.get('role', 'user')}: {msg.get('content', '')}\n"
        
        full_prompt = f"{self.system_prompt}\n\nContext:\n{context_str}\n\nHuman: {message}\n\nAssistant:"
        
        payload = {
            "model": self.config.model,
            "max_tokens": self.config.max_tokens,
            "temperature": self.config.temperature,
            "messages": [{"role": "user", "content": full_prompt}]
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(
                "https://api.anthropic.com/v1/messages",
                headers=headers,
                json=payload
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    return data["content"][0]["text"]
                else:
                    logger.error(f"Anthropic API error: {response.status}")
                    return "API call failed"
    
    async def _call_google(self, message: str, context: List[Dict] = None) -> str:
        """Call Google Gemini API"""
        # Implementation for Google Gemini API
        # Placeholder - implement based on Google's API specification
        return f"[Google Gemini response would go here for: {message[:50]}...]"
    
    async def _call_custom(self, message: str, context: List[Dict] = None) -> str:
        """Call custom LLM API"""
        # Implementation for custom LLM endpoints
        return f"[Custom LLM response would go here for: {message[:50]}...]"

class CollaborativeCouncilPlugin:
    """Main plugin class for collaborative councils"""
    
    def __init__(self, config: CouncilConfig):
        self.config = config
        self.agents: Dict[str, LLMAgent] = {}
        self.orchestrator = CooperativeOrchestrator()
        self.prompt_library = CollaborativePromptLibrary()
        self.active_sessions: Dict[str, Dict] = {}
        
        # Initialize agents
        for agent_config in config.agents:
            self.agents[agent_config.agent_id] = LLMAgent(agent_config)
    
    async def start_council_session(self, session_id: str, topic: str, 
                                  custom_roles: Dict[str, AgentRole] = None) -> Dict:
        """Start a new collaborative council session"""
        logger.info(f"Starting council session {session_id} for topic: {topic}")
        
        # Assign roles to agents
        roles = custom_roles or self.config.default_roles or self._auto_assign_roles()
        
        session_data = {
            'session_id': session_id,
            'topic': topic,
            'roles': roles,
            'started_at': datetime.now(),
            'status': 'active',
            'contributions': []
        }
        
        self.active_sessions[session_id] = session_data
        
        # Assign roles and prompts to each agent
        for agent_id, role in roles.items():
            if agent_id in self.agents:
                agent = self.agents[agent_id]
                other_agents = [aid for aid in roles.keys() if aid != agent_id]
                
                role_prompt = self.prompt_library.generate_role_assignment_prompt(
                    agent_id, role, 
                    session_context=f"Council session on: {topic}",
                    other_agents=other_agents
                )
                
                await agent.assign_role(role, role_prompt)
        
        return {
            'session_id': session_id,
            'status': 'started',
            'participants': list(roles.keys()),
            'roles': {aid: role.value for aid, role in roles.items()}
        }
    
    async def add_contribution(self, session_id: str, agent_id: str, 
                             message: str, contribution_type: ContributionType = None) -> Dict:
        """Add a contribution to the council session"""
        if session_id not in self.active_sessions:
            raise ValueError(f"Session {session_id} not found")
            
        session = self.active_sessions[session_id]
        agent = self.agents.get(agent_id)
        
        if not agent:
            raise ValueError(f"Agent {agent_id} not found")
        
        # Generate agent response based on role and context
        context = self._build_conversation_context(session_id)
        response = await agent.generate_response(message, context)
        
        # Determine contribution type if not specified
        if not contribution_type:
            contribution_type = self._infer_contribution_type(response, agent.current_role)
        
        # Process through safeguards
        safeguards_result = await self.orchestrator.process_contribution(
            agent_id, response, contribution_type, session_id
        )
        
        # Store contribution
        contribution = {
            'agent_id': agent_id,
            'role': agent.current_role.value if agent.current_role else 'unassigned',
            'message': message,
            'response': response,
            'contribution_type': contribution_type.value,
            'timestamp': datetime.now(),
            'safeguards_result': safeguards_result
        }
        
        session['contributions'].append(contribution)
        
        # Handle interventions
        result = await self._handle_interventions(session_id, safeguards_result)
        
        return {
            'contribution_id': len(session['contributions']) - 1,
            'agent_response': response,
            'safeguards_status': safeguards_result['action'],
            'intervention_result': result
        }
    
    async def request_synthesis(self, session_id: str, topic: str = None) -> Dict:
        """Manually request synthesis from the council"""
        if session_id not in self.active_sessions:
            raise ValueError(f"Session {session_id} not found")
            
        session = self.active_sessions[session_id]
        
        # Find an agent with synthesizer capability or assign one
        synthesizer_agent_id = self._find_synthesizer_agent(session_id)
        if not synthesizer_agent_id:
            # Assign synthesizer role to first available agent
            synthesizer_agent_id = list(self.agents.keys())[0]
            await self._reassign_agent_role(synthesizer_agent_id, AgentRole.SYNTHESIZER, session_id)
        
        # Get recent contributions for synthesis
        recent_contributions = [
            contrib['response'] for contrib in session['contributions'][-5:]
        ]
        
        synthesis_topic = topic or session['topic']
        synthesis_prompt = self.prompt_library.generate_consensus_prompt(
            synthesis_topic, recent_contributions
        )
        
        # Generate synthesis
        agent = self.agents[synthesizer_agent_id]
        context = self._build_conversation_context(session_id)
        synthesis_response = await agent.generate_response(synthesis_prompt, context)
        
        # Store synthesis contribution
        contribution = {
            'agent_id': synthesizer_agent_id,
            'role': 'synthesizer',
            'message': synthesis_prompt,
            'response': synthesis_response,
            'contribution_type': 'synthesize',
            'timestamp': datetime.now(),
            'is_synthesis': True
        }
        
        session['contributions'].append(contribution)
        
        return {
            'synthesis_agent': synthesizer_agent_id,
            'synthesis_response': synthesis_response,
            'status': 'synthesis_complete'
        }
    
    async def get_session_status(self, session_id: str) -> Dict:
        """Get current status of a council session"""
        if session_id not in self.active_sessions:
            raise ValueError(f"Session {session_id} not found")
            
        session = self.active_sessions[session_id]
        
        # Get collaboration health
        collaboration_report = self.orchestrator.get_collaboration_report(session_id)
        
        return {
            'session_id': session_id,
            'topic': session['topic'],
            'status': session['status'],
            'participants': len(session['roles']),
            'contributions': len(session['contributions']),
            'collaboration_health': collaboration_report.get('collaboration_health', {}),
            'recent_activity': session['contributions'][-3:] if session['contributions'] else []
        }
    
    async def end_session(self, session_id: str) -> Dict:
        """End a council session and generate final report"""
        if session_id not in self.active_sessions:
            raise ValueError(f"Session {session_id} not found")
            
        session = self.active_sessions[session_id]
        session['status'] = 'completed'
        session['ended_at'] = datetime.now()
        
        # Generate final report
        final_report = self.orchestrator.get_collaboration_report(session_id)
        
        return {
            'session_id': session_id,
            'status': 'completed',
            'final_report': final_report,
            'summary': self._generate_session_summary(session)
        }
    
    def _auto_assign_roles(self) -> Dict[str, AgentRole]:
        """Auto-assign roles based on available agents"""
        roles = [AgentRole.PROPOSER, AgentRole.CRITIC, AgentRole.SYNTHESIZER, 
                AgentRole.IMPLEMENTER, AgentRole.OBSERVER]
        
        assignments = {}
        agent_ids = list(self.agents.keys())
        
        for i, agent_id in enumerate(agent_ids):
            role = roles[i % len(roles)]
            assignments[agent_id] = role
            
        return assignments
    
    def _build_conversation_context(self, session_id: str) -> List[Dict]:
        """Build conversation context for agents"""
        session = self.active_sessions[session_id]
        context = []
        
        for contrib in session['contributions'][-10:]:  # Last 10 contributions
            context.append({
                'role': contrib['agent_id'],
                'content': contrib['response']
            })
            
        return context
    
    def _infer_contribution_type(self, response: str, agent_role: Optional[AgentRole]) -> ContributionType:
        """Infer contribution type from response and agent role"""
        response_lower = response.lower()
        
        # Role-based inference
        if agent_role == AgentRole.PROPOSER:
            return ContributionType.PROPOSE
        elif agent_role == AgentRole.CRITIC:
            return ContributionType.CRITIQUE
        elif agent_role == AgentRole.SYNTHESIZER:
            return ContributionType.SYNTHESIZE
        
        # Content-based inference
        if any(word in response_lower for word in ['suggest', 'propose', 'recommend']):
            return ContributionType.PROPOSE
        elif any(word in response_lower for word in ['concern', 'issue', 'problem']):
            return ContributionType.CRITIQUE
        elif any(word in response_lower for word in ['combine', 'merge', 'synthesis']):
            return ContributionType.SYNTHESIZE
        elif any(word in response_lower for word in ['agree', 'support', 'excellent']):
            return ContributionType.SUPPORT
        
        return ContributionType.IMPROVE  # Default
    
    async def _handle_interventions(self, session_id: str, safeguards_result: Dict) -> Dict:
        """Handle interventions based on safeguards results"""
        action = safeguards_result['action']
        
        if action == 'synthesis_triggered':
            # Automatic synthesis was triggered
            synthesis_result = await self.request_synthesis(session_id)
            return {'type': 'automatic_synthesis', 'result': synthesis_result}
            
        elif action == 'intervention_needed':
            warnings = safeguards_result.get('warnings', {})
            recommendations = safeguards_result.get('recommendations', [])
            
            # Handle specific interventions
            if 'excessive_contradictions' in warnings:
                # Trigger consensus building
                consensus_result = await self.request_synthesis(session_id)
                return {'type': 'consensus_building', 'result': consensus_result}
                
            elif 'idea_hoarding' in warnings:
                # Rotate speaking order or roles
                await self._rotate_roles(session_id)
                return {'type': 'role_rotation', 'result': 'Roles rotated to improve participation'}
                
        return {'type': 'none', 'result': 'No intervention needed'}
    
    async def _rotate_roles(self, session_id: str):
        """Rotate agent roles to prevent dominance"""
        session = self.active_sessions[session_id]
        current_roles = session['roles']
        
        # Simple rotation: shift roles by one position
        agent_ids = list(current_roles.keys())
        roles = list(current_roles.values())
        
        new_assignments = {}
        for i, agent_id in enumerate(agent_ids):
            new_role = roles[(i + 1) % len(roles)]
            new_assignments[agent_id] = new_role
            
            # Update agent with new role
            agent = self.agents[agent_id]
            role_prompt = self.prompt_library.generate_role_assignment_prompt(
                agent_id, new_role,
                session_context=f"Council session on: {session['topic']} (role rotated)",
                other_agents=[aid for aid in agent_ids if aid != agent_id]
            )
            await agent.assign_role(new_role, role_prompt)
        
        session['roles'] = new_assignments
    
    def _find_synthesizer_agent(self, session_id: str) -> Optional[str]:
        """Find an agent currently assigned as synthesizer"""
        session = self.active_sessions[session_id]
        
        for agent_id, role in session['roles'].items():
            if role == AgentRole.SYNTHESIZER:
                return agent_id
        return None
    
    async def _reassign_agent_role(self, agent_id: str, new_role: AgentRole, session_id: str):
        """Reassign a specific agent to a new role"""
        session = self.active_sessions[session_id]
        session['roles'][agent_id] = new_role
        
        agent = self.agents[agent_id]
        other_agents = [aid for aid in session['roles'].keys() if aid != agent_id]
        
        role_prompt = self.prompt_library.generate_role_assignment_prompt(
            agent_id, new_role,
            session_context=f"Council session on: {session['topic']}",
            other_agents=other_agents
        )
        
        await agent.assign_role(new_role, role_prompt)
    
    def _generate_session_summary(self, session: Dict) -> str:
        """Generate a summary of the session"""
        return f"""
Session Summary:
- Topic: {session['topic']}
- Duration: {session.get('ended_at', datetime.now()) - session['started_at']}
- Total Contributions: {len(session['contributions'])}
- Participants: {len(session['roles'])}
- Synthesis Events: {sum(1 for c in session['contributions'] if c.get('is_synthesis', False))}
        """.strip()

# FastAPI integration for REST API
class CollaborativeCouncilAPI:
    """REST API wrapper for the collaborative council plugin"""
    
    def __init__(self):
        self.councils: Dict[str, CollaborativeCouncilPlugin] = {}
    
    def register_council(self, config: CouncilConfig) -> str:
        """Register a new council configuration"""
        council = CollaborativeCouncilPlugin(config)
        self.councils[config.council_id] = council
        return config.council_id
    
    async def create_session(self, council_id: str, topic: str, 
                           custom_roles: Dict[str, str] = None) -> Dict:
        """Create a new council session via API"""
        if council_id not in self.councils:
            raise ValueError(f"Council {council_id} not found")
            
        council = self.councils[council_id]
        session_id = f"{council_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        # Convert string roles to AgentRole enum if provided
        role_dict = {}
        if custom_roles:
            for agent_id, role_str in custom_roles.items():
                role_dict[agent_id] = AgentRole(role_str)
        
        return await council.start_council_session(session_id, topic, role_dict)
    
    async def add_message(self, session_id: str, agent_id: str, message: str) -> Dict:
        """Add a message to council session via API"""
        # Find council containing this session
        council = self._find_council_by_session(session_id)
        if not council:
            raise ValueError(f"Session {session_id} not found")
            
        return await council.add_contribution(session_id, agent_id, message)
    
    async def get_status(self, session_id: str) -> Dict:
        """Get session status via API"""
        council = self._find_council_by_session(session_id)
        if not council:
            raise ValueError(f"Session {session_id} not found")
            
        return await council.get_session_status(session_id)
    
    def _find_council_by_session(self, session_id: str) -> Optional[CollaborativeCouncilPlugin]:
        """Find which council contains a session"""
        for council in self.councils.values():
            if session_id in council.active_sessions:
                return council
        return None

# Example usage and configuration
def create_c42_council_config() -> CouncilConfig:
    """Create a council configuration for C42 OS governance"""
    
    # Example agent configurations (replace with real API keys)
    agents = [
        AgentConfig(
            agent_id="claude_policy",
            provider=LLMProvider.ANTHROPIC,
            model="claude-3-sonnet-20240229",
            api_key=os.getenv("ANTHROPIC_API_KEY", "your-key-here"),
            personality_traits={"collaborative": 0.9, "diplomatic": 0.8},
            specialized_domains=["policy", "governance", "ethics"]
        ),
        AgentConfig(
            agent_id="gpt_technical",
            provider=LLMProvider.OPENAI,
            model="gpt-4",
            api_key=os.getenv("OPENAI_API_KEY", "your-key-here"),
            personality_traits={"analytical": 0.9, "detailed": 0.8},
            specialized_domains=["technical", "implementation", "security"]
        ),
        AgentConfig(
            agent_id="gemini_community",
            provider=LLMProvider.GOOGLE,
            model="gemini-pro",
            api_key=os.getenv("GOOGLE_API_KEY", "your-key-here"),
            personality_traits={"collaborative": 0.9, "empathetic": 0.8},
            specialized_domains=["community", "user_experience", "accessibility"]
        )
    ]
    
    return CouncilConfig(
        council_id="c42_governance_council",
        name="C42 OS Governance Council",
        description="Collaborative council for C42 OS governance decisions",
        agents=agents,
        default_roles={
            "claude_policy": AgentRole.FACILITATOR,
            "gpt_technical": AgentRole.IMPLEMENTER,
            "gemini_community": AgentRole.OBSERVER
        },
        intervention_thresholds={
            "max_contradictions": 3,
            "synthesis_trigger": 0.7,
            "participation_imbalance": 0.3
        }
    )

# Demo function
async def demo_plugin_integration():
    """Demonstrate the plugin integration"""
    print("🚀 COLLABORATIVE COUNCIL PLUGIN INTEGRATION DEMO")
    print("=" * 60)
    
    # Create council configuration
    config = create_c42_council_config()
    
    # Initialize council plugin
    council = CollaborativeCouncilPlugin(config)
    
    # Start a session
    session_result = await council.start_council_session(
        session_id="demo_session", 
        topic="Should C42 OS implement blockchain-based voting?"
    )
    
    print("✅ Council session started:")
    print(json.dumps(session_result, indent=2))
    
    # Simulate some contributions
    contributions = [
        ("claude_policy", "This is an important governance question that deserves careful consideration from multiple perspectives."),
        ("gpt_technical", "From a technical standpoint, blockchain voting introduces both benefits and risks we should evaluate."),
        ("gemini_community", "We should consider how this affects user accessibility and trust in the system.")
    ]
    
    print("\n💬 Adding contributions...")
    for agent_id, message in contributions:
        result = await council.add_contribution("demo_session", agent_id, message)
        print(f"Agent {agent_id}: {result['agent_response'][:100]}...")
    
    # Get session status
    status = await council.get_session_status("demo_session")
    print(f"\n📊 Collaboration Health: {status['collaboration_health']['status']}")
    
    # Request synthesis
    synthesis = await council.request_synthesis("demo_session")
    print(f"\n🔄 Synthesis: {synthesis['synthesis_response'][:150]}...")
    
    print("\n✅ Plugin integration demonstration complete!")

if __name__ == "__main__":
    asyncio.run(demo_plugin_integration())
