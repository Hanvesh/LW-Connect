"""AI training data for mentor recommendations."""
from typing import List, Dict
import json

# Training data mapping learner needs to Indian mentor expertise
MENTOR_RECOMMENDATION_TRAINING_DATA = [
    {
        "learner_profile": {
            "interests": ["digital governance", "e-governance"],
            "career_goals": ["policy advisor", "government digital transformation"],
            "current_role": "junior policy analyst"
        },
        "recommended_mentors": ["rajesh.kumar@lwconnect.in", "lakshmi.iyer@lwconnect.in"],
        "reasoning": "Digital governance expertise and policy background"
    },
    {
        "learner_profile": {
            "interests": ["innovation", "design thinking"],
            "career_goals": ["innovation lead", "service design"],
            "current_role": "program officer"
        },
        "recommended_mentors": ["priya.sharma@lwconnect.in", "nisha.gupta@lwconnect.in"],
        "reasoning": "Innovation and citizen-centric service design expertise"
    },
    {
        "learner_profile": {
            "interests": ["data analytics", "evidence-based policy"],
            "career_goals": ["data analyst", "policy researcher"],
            "current_role": "research assistant"
        },
        "recommended_mentors": ["amit.patel@lwconnect.in"],
        "reasoning": "Data analytics and evidence-based policymaking specialization"
    },
    {
        "learner_profile": {
            "interests": ["cybersecurity", "data privacy"],
            "career_goals": ["security officer", "compliance manager"],
            "current_role": "IT officer"
        },
        "recommended_mentors": ["vikram.singh@lwconnect.in"],
        "reasoning": "Government cybersecurity and data privacy expertise"
    },
    {
        "learner_profile": {
            "interests": ["smart cities", "urban development"],
            "career_goals": ["urban planner", "smart city coordinator"],
            "current_role": "municipal officer"
        },
        "recommended_mentors": ["anjali.desai@lwconnect.in"],
        "reasoning": "Smart city planning and sustainable urban development"
    },
    {
        "learner_profile": {
            "interests": ["public finance", "budget management"],
            "career_goals": ["finance officer", "budget analyst"],
            "current_role": "accounts officer"
        },
        "recommended_mentors": ["suresh.reddy@lwconnect.in"],
        "reasoning": "Public financial management and budget reforms expertise"
    },
    {
        "learner_profile": {
            "interests": ["healthcare", "telemedicine"],
            "career_goals": ["health program manager", "digital health lead"],
            "current_role": "health officer"
        },
        "recommended_mentors": ["meera.krishnan@lwconnect.in"],
        "reasoning": "Digital health and telemedicine program expertise"
    },
    {
        "learner_profile": {
            "interests": ["education", "digital learning"],
            "career_goals": ["education officer", "training coordinator"],
            "current_role": "teacher"
        },
        "recommended_mentors": ["arjun.mehta@lwconnect.in"],
        "reasoning": "Education technology and digital learning initiatives"
    },
    {
        "learner_profile": {
            "interests": ["social welfare", "benefit schemes"],
            "career_goals": ["welfare officer", "program manager"],
            "current_role": "social worker"
        },
        "recommended_mentors": ["kavita.nair@lwconnect.in"],
        "reasoning": "Social welfare schemes and DBT systems expertise"
    },
    {
        "learner_profile": {
            "interests": ["agriculture", "rural development"],
            "career_goals": ["agricultural officer", "rural development coordinator"],
            "current_role": "field officer"
        },
        "recommended_mentors": ["rahul.verma@lwconnect.in"],
        "reasoning": "Agricultural innovation and farmer welfare programs"
    },
    {
        "learner_profile": {
            "interests": ["legal", "regulatory compliance"],
            "career_goals": ["legal advisor", "compliance officer"],
            "current_role": "legal assistant"
        },
        "recommended_mentors": ["deepa.menon@lwconnect.in"],
        "reasoning": "Legal frameworks and regulatory reform expertise"
    },
    {
        "learner_profile": {
            "interests": ["blockchain", "emerging technology"],
            "career_goals": ["technology officer", "innovation specialist"],
            "current_role": "IT professional"
        },
        "recommended_mentors": ["karthik.subramanian@lwconnect.in"],
        "reasoning": "Blockchain and emerging technology applications"
    },
    {
        "learner_profile": {
            "interests": ["citizen services", "grievance redressal"],
            "career_goals": ["service delivery manager", "citizen engagement lead"],
            "current_role": "public relations officer"
        },
        "recommended_mentors": ["nisha.gupta@lwconnect.in", "priya.sharma@lwconnect.in"],
        "reasoning": "Citizen services optimization and engagement expertise"
    },
    {
        "learner_profile": {
            "interests": ["infrastructure", "project management"],
            "career_goals": ["project manager", "infrastructure coordinator"],
            "current_role": "engineer"
        },
        "recommended_mentors": ["sanjay.rao@lwconnect.in"],
        "reasoning": "Infrastructure development and PPP model expertise"
    }
]

# Availability mapping for scheduling recommendations
AVAILABILITY_PATTERNS = {
    "weekdays_mornings": {
        "days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "time_slots": ["09:00-12:00"],
        "timezone": "IST"
    },
    "weekdays_afternoons": {
        "days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "time_slots": ["14:00-17:00"],
        "timezone": "IST"
    },
    "weekdays_evenings": {
        "days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "time_slots": ["18:00-21:00"],
        "timezone": "IST"
    },
    "weekends": {
        "days": ["Saturday", "Sunday"],
        "time_slots": ["10:00-13:00", "15:00-18:00"],
        "timezone": "IST"
    },
    "flexible": {
        "days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        "time_slots": ["09:00-12:00", "14:00-17:00", "18:00-21:00"],
        "timezone": "IST"
    }
}


def get_training_data() -> List[Dict]:
    """Return training data for AI model."""
    return MENTOR_RECOMMENDATION_TRAINING_DATA


def get_availability_pattern(availability_type: str) -> Dict:
    """Get availability pattern for a mentor."""
    return AVAILABILITY_PATTERNS.get(availability_type, AVAILABILITY_PATTERNS["flexible"])


def export_training_data(filepath: str = "mentor_training_data.json"):
    """Export training data to JSON file."""
    data = {
        "training_data": MENTOR_RECOMMENDATION_TRAINING_DATA,
        "availability_patterns": AVAILABILITY_PATTERNS
    }
    with open(filepath, 'w') as f:
        json.dump(data, f, indent=2)
    print(f"✅ Training data exported to {filepath}")


if __name__ == "__main__":
    export_training_data()
