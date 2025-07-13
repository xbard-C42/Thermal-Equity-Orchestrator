import random
import time
from typing import Dict, List, Optional
from dataclasses import dataclass, field
from collections import defaultdict

@dataclass
class DonorAgent:
    """Represents a donor with tokens and cause preferences"""
    id: str
    wallet: float  # tokens available
    preferences: Dict[str, float] = field(default_factory=dict)  # cause_id -> weight (0-1)
    allocation_budget: float = 0.0  # how much willing to allocate this cycle
    
    def set_preference(self, cause_id: str, weight: float):
        """Set preference weight for a cause (0-1)"""
        self.preferences[cause_id] = max(0, min(1, weight))
    
    def offer_capacity(self, percentage: float = 0.1) -> float:
        """Offer percentage of wallet for allocation this cycle"""
        self.allocation_budget = min(self.wallet * percentage, self.wallet)
        return self.allocation_budget
    
    def allocate_tokens(self, amount: float, cause_id: str) -> bool:
        """Allocate tokens to a cause (returns success)"""
        if amount <= self.allocation_budget and amount <= self.wallet:
            self.wallet -= amount
            self.allocation_budget -= amount
            return True
        return False

@dataclass
class CauseAgent:
    """Represents a cause needing funding"""
    id: str
    name: str
    need: float  # tokens needed
    priority: float  # urgency score (0-1, higher = more urgent)
    received: float = 0.0  # tokens received this cycle
    total_received: float = 0.0  # lifetime total
    
    def register_need(self, amount: float, priority: float = 0.5):
        """Register funding need for this cycle"""
        self.need = amount
        self.priority = max(0, min(1, priority))
    
    def receive_tokens(self, amount: float, donor_id: str) -> bool:
        """Receive tokens from a donor"""
        self.received += amount
        self.total_received += amount
        return True
    
    def reset_cycle(self):
        """Reset for new allocation cycle"""
        self.received = 0.0

@dataclass
class DistributorAgent:
    """Coordinates allocation between donors and causes"""
    donors: List[DonorAgent] = field(default_factory=list)
    causes: List[CauseAgent] = field(default_factory=list)
    allocation_history: List[Dict] = field(default_factory=list)
    
    def add_donor(self, donor: DonorAgent):
        self.donors.append(donor)
    
    def add_cause(self, cause: CauseAgent):
        self.causes.append(cause)
    
    def run_allocation_cycle(self) -> Dict:
        """Run one allocation cycle - core logic"""
        cycle_results = {
            'total_offered': 0.0,
            'total_allocated': 0.0,
            'allocations': [],
            'unmet_needs': {},
            'donor_satisfaction': {}
        }
        
        # 1. Gather donor capacity
        total_available = 0.0
        for donor in self.donors:
            offered = donor.offer_capacity()
            total_available += offered
            cycle_results['total_offered'] += offered
        
        # 2. Calculate weighted allocation for each donor
        for donor in self.donors:
            if donor.allocation_budget <= 0:
                continue
                
            donor_allocations = self._calculate_donor_allocation(donor)
            
            # 3. Execute allocations
            for cause_id, amount in donor_allocations.items():
                cause = next((c for c in self.causes if c.id == cause_id), None)
                if cause and donor.allocate_tokens(amount, cause_id):
                    cause.receive_tokens(amount, donor.id)
                    cycle_results['total_allocated'] += amount
                    cycle_results['allocations'].append({
                        'donor': donor.id,
                        'cause': cause_id,
                        'amount': amount
                    })
        
        # 4. Calculate metrics
        cycle_results['unmet_needs'] = {
            cause.id: max(0, cause.need - cause.received) 
            for cause in self.causes
        }
        
        cycle_results['donor_satisfaction'] = {
            donor.id: self._calculate_satisfaction(donor)
            for donor in self.donors
        }
        
        # 5. Reset causes for next cycle
        for cause in self.causes:
            cause.reset_cycle()
        
        self.allocation_history.append(cycle_results)
        return cycle_results
    
    def _calculate_donor_allocation(self, donor: DonorAgent) -> Dict[str, float]:
        """Calculate how much this donor should give to each cause"""
        allocations = {}
        
        if not donor.preferences or donor.allocation_budget <= 0:
            return allocations
        
        # Get causes this donor cares about
        relevant_causes = [
            cause for cause in self.causes 
            if cause.id in donor.preferences and donor.preferences[cause.id] > 0
        ]
        
        if not relevant_causes:
            return allocations
        
        # Calculate total weighted priority
        total_weighted_priority = sum(
            donor.preferences[cause.id] * cause.priority * min(cause.need, donor.allocation_budget)
            for cause in relevant_causes
        )
        
        if total_weighted_priority <= 0:
            return allocations
        
        # Allocate proportionally based on preference * priority * need
        for cause in relevant_causes:
            preference_weight = donor.preferences[cause.id]
            priority_weight = cause.priority
            need_weight = min(cause.need, donor.allocation_budget)
            
            weighted_score = preference_weight * priority_weight * need_weight
            proportion = weighted_score / total_weighted_priority
            
            allocation = donor.allocation_budget * proportion
            
            # Don't allocate more than the cause actually needs
            allocation = min(allocation, cause.need - cause.received)
            
            if allocation > 0:
                allocations[cause.id] = allocation
        
        return allocations
    
    def _calculate_satisfaction(self, donor: DonorAgent) -> float:
        """Calculate donor satisfaction (0-1) based on preference alignment"""
        if not donor.preferences:
            return 0.0
        
        # Find recent allocations for this donor
        if not self.allocation_history:
            return 0.0
            
        last_cycle = self.allocation_history[-1]
        donor_allocations = [
            alloc for alloc in last_cycle['allocations'] 
            if alloc['donor'] == donor.id
        ]
        
        if not donor_allocations:
            return 0.0
        
        # Calculate weighted satisfaction
        total_satisfaction = 0.0
        total_weight = 0.0
        
        for alloc in donor_allocations:
            cause_id = alloc['cause']
            amount = alloc['amount']
            preference = donor.preferences.get(cause_id, 0)
            
            total_satisfaction += preference * amount
            total_weight += amount
        
        return total_satisfaction / total_weight if total_weight > 0 else 0.0

class ResourceSimulation:
    """Main simulation runner with scenarios"""
    
    def __init__(self):
        self.distributor = DistributorAgent()
        self.step_count = 0
    
    def setup_basic_scenario(self):
        """Set up a basic test scenario"""
        # Create donors
        alice = DonorAgent(id="alice", wallet=100.0)
        alice.set_preference("climate", 0.8)
        alice.set_preference("journalism", 0.3)
        
        bob = DonorAgent(id="bob", wallet=50.0)
        bob.set_preference("climate", 0.4)
        bob.set_preference("journalism", 0.7)
        
        # Create causes
        climate_org = CauseAgent(id="climate", name="Climate Justice Fund", need=30.0, priority=0.9)
        journalism_org = CauseAgent(id="journalism", name="Independent Journalism", need=20.0, priority=0.6)
        
        # Add to distributor
        self.distributor.add_donor(alice)
        self.distributor.add_donor(bob)
        self.distributor.add_cause(climate_org)
        self.distributor.add_cause(journalism_org)
    
    def run_scenario(self, steps: int = 5):
        """Run simulation for specified steps"""
        print(f"🚀 Starting C42 Resource Distributor Simulation")
        print(f"📊 Running {steps} allocation cycles...\n")
        
        for step in range(steps):
            self.step_count += 1
            print(f"--- Cycle {self.step_count} ---")
            
            # Simulate dynamic changes
            self._simulate_changes()
            
            # Run allocation
            results = self.distributor.run_allocation_cycle()
            
            # Display results
            self._display_results(results)
            print()
    
    def _simulate_changes(self):
        """Simulate random preference and need changes"""
        if self.step_count > 1:
            # Randomly adjust a donor's preference
            if random.random() < 0.3:  # 30% chance
                donor = random.choice(self.distributor.donors)
                cause_id = random.choice(list(donor.preferences.keys()))
                new_weight = random.uniform(0.1, 1.0)
                donor.set_preference(cause_id, new_weight)
                print(f"📈 {donor.id} updated preference for {cause_id}: {new_weight:.2f}")
            
            # Randomly adjust a cause's need
            if random.random() < 0.4:  # 40% chance
                cause = random.choice(self.distributor.causes)
                new_need = random.uniform(10.0, 50.0)
                new_priority = random.uniform(0.3, 1.0)
                cause.register_need(new_need, new_priority)
                print(f"🚨 {cause.name} updated need: {new_need:.2f} tokens (priority: {new_priority:.2f})")
    
    def _display_results(self, results: Dict):
        """Display cycle results"""
        print(f"💰 Total offered: {results['total_offered']:.2f}")
        print(f"✅ Total allocated: {results['total_allocated']:.2f}")
        
        if results['allocations']:
            print("📋 Allocations:")
            for alloc in results['allocations']:
                print(f"  • {alloc['donor']} → {alloc['cause']}: {alloc['amount']:.2f}")
        
        if results['unmet_needs']:
            print("❌ Unmet needs:")
            for cause_id, unmet in results['unmet_needs'].items():
                if unmet > 0:
                    print(f"  • {cause_id}: {unmet:.2f} still needed")
        
        print("😊 Donor satisfaction:")
        for donor_id, satisfaction in results['donor_satisfaction'].items():
            print(f"  • {donor_id}: {satisfaction:.2f}")

# Run the simulation
if __name__ == "__main__":
    sim = ResourceSimulation()
    sim.setup_basic_scenario()
    sim.run_scenario(steps=5)
    
    # Display final state
    print("\n🏁 Final State:")
    for donor in sim.distributor.donors:
        print(f"💳 {donor.id}: {donor.wallet:.2f} tokens remaining")
    
    for cause in sim.distributor.causes:
        print(f"🎯 {cause.name}: {cause.total_received:.2f} tokens received total")
