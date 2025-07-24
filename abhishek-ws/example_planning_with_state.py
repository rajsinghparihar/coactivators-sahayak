"""
Example: Using Lesson Planning Agent with Session State

This example demonstrates how to use the lesson_planning_agent with session state
to remember teacher preferences and planning history.
"""

import asyncio
from google.adk.sessions import InMemorySessionService
from google.adk.runners import Runner
from google.genai import types
from agents.planning import lesson_planning_agent
from utils import (
    initialize_planning_state,
    update_planning_state,
    get_teacher_preferences,
    suggest_teaching_improvements
)


async def run_planning_with_state():
    """Run lesson planning agent with session state management."""
    
    # Initialize session service
    session_service = InMemorySessionService()
    
    # Create runner
    runner = Runner(
        agent=lesson_planning_agent,
        session_service=session_service,
        app_name="lesson_planning_app"
    )
    
    # Teacher and session identifiers
    teacher_id = "teacher_456"
    app_name = "lesson_planning_app"
    session_id = "planning_session_001"
    
    # Initialize session state
    initial_state = initialize_planning_state(
        teacher_id=teacher_id,
        default_style="interactive"
    )
    
    # Create session
    session = await session_service.create_session(
        app_name=app_name,
        user_id=teacher_id,
        session_id=session_id
    )
    
    # Set initial state
    session.state.update(initial_state)
    
    print("📋 Lesson Planning Agent with Session State")
    print("=" * 50)
    
    # Example 1: Create a lesson plan for a topic
    print("\n📚 Creating lesson plan for 'Fractions'...")
    
    # Update state to show planning has started
    updated_state = update_planning_state(
        current_state=session.state,
        topic="fractions",
        grade_level="5th",
        planning_stage="subtopic_decomposition"
    )
    session.state.update(updated_state)
    
    response1_generator = runner.run(
        user_id=teacher_id,
        session_id=session_id,
        new_message=types.Content(
            parts=[types.Part(text="Create a weekly lesson plan for teaching 'Fractions' to 5th grade students. I prefer interactive teaching with 45-minute classes.")]
        )
    )
    
    # Get the final response from the generator
    response1 = None
    for event in response1_generator:
        if hasattr(event, 'content'):
            response1 = event
    
    if response1:
        print(f"Response: {response1.content}")
    else:
        print("No response received")
    
    # Update state to show planning is completed
    updated_state = update_planning_state(
        current_state=session.state,
        topic="fractions",
        grade_level="5th",
        planning_stage="completed",
        plan_rating=4.5
    )
    session.state.update(updated_state)
    
    # Example 2: Create another lesson plan (should remember preferences)
    print("\n🌍 Creating lesson plan for 'Ancient Civilizations'...")
    
    # Update state for new planning session
    updated_state = update_planning_state(
        current_state=session.state,
        topic="ancient_civilizations",
        grade_level="6th",
        planning_stage="subtopic_decomposition"
    )
    session.state.update(updated_state)
    
    response2_generator = runner.run(
        user_id=teacher_id,
        session_id=session_id,
        new_message=types.Content(
            parts=[types.Part(text="Generate a lesson plan for 'Ancient Civilizations' for 6th grade. I want to include project-based learning activities.")]
        )
    )
    
    # Get the final response from the generator
    response2 = None
    for event in response2_generator:
        if hasattr(event, 'content'):
            response2 = event
    
    if response2:
        print(f"Response: {response2.content}")
    else:
        print("No response received")
    
    # Update state to show planning is completed
    updated_state = update_planning_state(
        current_state=session.state,
        topic="ancient_civilizations",
        grade_level="6th",
        planning_stage="completed",
        plan_rating=4.8
    )
    session.state.update(updated_state)
    
    # Example 3: Ask for suggestions based on planning history
    print("\n💡 Asking for teaching improvement suggestions...")
    
    response3_generator = runner.run(
        user_id=teacher_id,
        session_id=session_id,
        new_message=types.Content(
            parts=[types.Part(text="Based on my planning history, what improvements would you suggest for my teaching approach?")]
        )
    )
    
    # Get the final response from the generator
    response3 = None
    for event in response3_generator:
        if hasattr(event, 'content'):
            response3 = event
    
    if response3:
        print(f"Response: {response3.content}")
    else:
        print("No response received")
    
    # Example 4: Create a plan for a previously used topic
    print("\n🔄 Creating plan for previously used topic...")
    
    response4_generator = runner.run(
        user_id=teacher_id,
        session_id=session_id,
        new_message=types.Content(
            parts=[types.Part(text="I want to create another lesson plan for 'Fractions' but for 4th grade this time. Can you suggest improvements based on my previous plan?")]
        )
    )
    
    # Get the final response from the generator
    response4 = None
    for event in response4_generator:
        if hasattr(event, 'content'):
            response4 = event
    
    if response4:
        print(f"Response: {response4.content}")
    else:
        print("No response received")
    
    # Display current session state
    print("\n📊 Current Session State:")
    print(f"Teacher Preferences: {get_teacher_preferences(session.state)}")
    print(f"Recent Plans: {session.state.get('recent_plans', [])}")
    print(f"Planning History: {session.state.get('planning_history', {})}")
    print(f"Teaching Suggestions: {suggest_teaching_improvements(session.state)}")
    
    return session


if __name__ == "__main__":
    # Run the example
    asyncio.run(run_planning_with_state()) 