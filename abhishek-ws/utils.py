"""
Session State Manager for Fun Activity and Planning Features

This module provides utilities to initialize and manage session state for both
the fun_activity and planning agents, following ADK session state patterns.
"""

from typing import Dict, Any, Optional
from datetime import datetime
import json


def initialize_fun_activity_state(user_id: str, grade_level: str = "5th") -> Dict[str, Any]:
    """
    Initialize session state for fun_activity_agent.
    
    Args:
        user_id: Unique identifier for the user
        grade_level: Default grade level for activities
        
    Returns:
        Dictionary containing initial fun activity session state
    """
    return {
        "user_preferences": {
            "preferred_activity_types": ["quiz", "scenario", "word_games", "fitb"],
            "grade_level": grade_level,
            "difficulty_preference": "medium",
            "session_duration": 30,  # minutes
            "user_id": user_id
        },
        "recent_topics": [],
        "activity_history": {
            "last_activity_type": None,
            "last_topic": None,
            "completion_rate": 0.0,
            "total_activities_generated": 0,
            "total_activities_completed": 0
        },
        "current_session": {
            "topic": None,
            "activities_generated": 0,
            "start_time": datetime.now().isoformat(),
            "session_id": f"fun_activity_{user_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        }
    }


def initialize_planning_state(teacher_id: str, default_style: str = "interactive") -> Dict[str, Any]:
    """
    Initialize session state for lesson_planning_agent.
    
    Args:
        teacher_id: Unique identifier for the teacher
        default_style: Default teaching style preference
        
    Returns:
        Dictionary containing initial planning session state
    """
    return {
        "teacher_preferences": {
            "preferred_teaching_style": default_style,  # interactive, lecture, project-based
            "class_duration": 45,  # minutes per class
            "sessions_per_week": 5,
            "assessment_frequency": "weekly",  # daily, weekly, end_of_unit
            "differentiation_needed": False,
            "teacher_id": teacher_id
        },
        "recent_plans": [],
        "current_planning_session": {
            "topic": None,
            "grade_level": None,
            "planning_stage": "initialized",  # initialized, subtopic_decomposition, objective_mapping, content_planning, completed
            "start_time": datetime.now().isoformat(),
            "session_id": f"planning_{teacher_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        },
        "planning_history": {
            "total_plans_created": 0,
            "average_plan_rating": 0.0,
            "most_used_topics": [],
            "most_used_grade_levels": []
        }
    }


def update_fun_activity_state(current_state: Dict[str, Any], 
                             topic: str, 
                             activity_type: str,
                             completed: bool = False) -> Dict[str, Any]:
    """
    Update fun activity session state with new activity information.
    
    Args:
        current_state: Current session state
        topic: Topic for the activity
        activity_type: Type of activity generated
        completed: Whether the activity was completed
        
    Returns:
        Updated session state
    """
    # Update recent topics (keep last 5)
    recent_topics = current_state.get("recent_topics", [])
    if topic not in recent_topics:
        recent_topics.insert(0, topic)
        recent_topics = recent_topics[:5]  # Keep only last 5
    
    # Update activity history
    activity_history = current_state.get("activity_history", {})
    total_generated = activity_history.get("total_activities_generated", 0) + 1
    total_completed = activity_history.get("total_activities_completed", 0)
    if completed:
        total_completed += 1
    
    completion_rate = total_completed / total_generated if total_generated > 0 else 0.0
    
    # Update current session
    current_session = current_state.get("current_session", {})
    activities_generated = current_session.get("activities_generated", 0) + 1
    
    return {
        **current_state,
        "recent_topics": recent_topics,
        "activity_history": {
            **activity_history,
            "last_activity_type": activity_type,
            "last_topic": topic,
            "completion_rate": completion_rate,
            "total_activities_generated": total_generated,
            "total_activities_completed": total_completed
        },
        "current_session": {
            **current_session,
            "topic": topic,
            "activities_generated": activities_generated
        }
    }


def update_planning_state(current_state: Dict[str, Any],
                         topic: str,
                         grade_level: str,
                         planning_stage: str,
                         plan_rating: Optional[float] = None) -> Dict[str, Any]:
    """
    Update planning session state with new planning information.
    
    Args:
        current_state: Current session state
        topic: Topic being planned
        grade_level: Grade level for the plan
        planning_stage: Current stage in planning process
        plan_rating: Optional rating for completed plans
        
    Returns:
        Updated session state
    """
    # Update current planning session
    current_session = current_state.get("current_planning_session", {})
    
    # Update recent plans if plan is completed
    recent_plans = current_state.get("recent_plans", [])
    if planning_stage == "completed":
        plan_entry = {
            "topic": topic,
            "grade": grade_level,
            "created_date": datetime.now().isoformat(),
            "plan_id": f"plan_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        }
        recent_plans.insert(0, plan_entry)
        recent_plans = recent_plans[:10]  # Keep only last 10
    
    # Update planning history
    planning_history = current_state.get("planning_history", {})
    total_plans = planning_history.get("total_plans_created", 0)
    
    if planning_stage == "completed":
        total_plans += 1
        
        # Update average rating if provided
        if plan_rating is not None:
            current_avg = planning_history.get("average_plan_rating", 0.0)
            total_rating = current_avg * (total_plans - 1) + plan_rating
            new_avg = total_rating / total_plans
        else:
            new_avg = planning_history.get("average_plan_rating", 0.0)
        
        # Update most used topics
        most_used_topics = planning_history.get("most_used_topics", [])
        if topic not in most_used_topics:
            most_used_topics.append(topic)
        
        # Update most used grade levels
        most_used_grade_levels = planning_history.get("most_used_grade_levels", [])
        if grade_level not in most_used_grade_levels:
            most_used_grade_levels.append(grade_level)
    else:
        new_avg = planning_history.get("average_plan_rating", 0.0)
        most_used_topics = planning_history.get("most_used_topics", [])
        most_used_grade_levels = planning_history.get("most_used_grade_levels", [])
    
    return {
        **current_state,
        "recent_plans": recent_plans,
        "current_planning_session": {
            **current_session,
            "topic": topic,
            "grade_level": grade_level,
            "planning_stage": planning_stage
        },
        "planning_history": {
            **planning_history,
            "total_plans_created": total_plans,
            "average_plan_rating": new_avg,
            "most_used_topics": most_used_topics,
            "most_used_grade_levels": most_used_grade_levels
        }
    }


def get_user_preferences(state: Dict[str, Any]) -> Dict[str, Any]:
    """Extract user preferences from fun activity state."""
    return state.get("user_preferences", {})


def get_teacher_preferences(state: Dict[str, Any]) -> Dict[str, Any]:
    """Extract teacher preferences from planning state."""
    return state.get("teacher_preferences", {})


def suggest_activity_types(state: Dict[str, Any]) -> list:
    """Suggest activity types based on user history and preferences."""
    preferences = get_user_preferences(state)
    history = state.get("activity_history", {})
    
    # Get preferred types
    preferred_types = preferences.get("preferred_activity_types", [])
    
    # If user has a favorite, prioritize it
    last_type = history.get("last_activity_type")
    if last_type and last_type in preferred_types:
        # Move favorite to front
        preferred_types.remove(last_type)
        preferred_types.insert(0, last_type)
    
    return preferred_types


def suggest_teaching_improvements(state: Dict[str, Any]) -> list:
    """Suggest teaching improvements based on planning history."""
    history = state.get("planning_history", {})
    preferences = get_teacher_preferences(state)
    
    suggestions = []
    
    # Suggest based on average rating
    avg_rating = history.get("average_plan_rating", 0.0)
    if avg_rating < 3.5:
        suggestions.append("Consider adding more interactive activities to improve engagement")
    
    # Suggest based on teaching style
    teaching_style = preferences.get("preferred_teaching_style", "interactive")
    if teaching_style == "lecture":
        suggestions.append("Try incorporating more project-based learning activities")
    
    # Suggest based on assessment frequency
    assessment_freq = preferences.get("assessment_frequency", "weekly")
    if assessment_freq == "end_of_unit":
        suggestions.append("Consider adding more frequent formative assessments for better student feedback")
    
    return suggestions 