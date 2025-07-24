"""
Example: Using Fun Activity Agent with Session State

This example demonstrates how to use the fun_activity_agent with session state
to remember user preferences and activity history.
"""

import asyncio
from google.adk.sessions import InMemorySessionService
from google.adk.runners import Runner
from google.genai import types
from agents.fun_activity import fun_activity_agent
from utils import (
    initialize_fun_activity_state,
    update_fun_activity_state,
    get_user_preferences,
    suggest_activity_types
)


async def run_fun_activity_with_state():
    """Run fun activity agent with session state management."""
    
    # Initialize session service
    session_service = InMemorySessionService()
    
    # Create runner
    runner = Runner(
        agent=fun_activity_agent,
        session_service=session_service,
        app_name="fun_activity_app"
    )
    
    # User and session identifiers
    user_id = "teacher_123"
    app_name = "fun_activity_app"
    session_id = "session_001"
    
    # Initialize session state
    initial_state = initialize_fun_activity_state(
        user_id=user_id,
        grade_level="5th"
    )
    
    # Create session
    session = await session_service.create_session(
        app_name=app_name,
        user_id=user_id,
        session_id=session_id
    )
    
    # Set initial state
    session.state.update(initial_state)
    
    print("🎯 Fun Activity Agent with Session State")
    print("=" * 50)
    
    # Example 1: Generate activities for a topic
    print("\n📚 Generating activities for 'Photosynthesis'...")
    
    response1_generator = runner.run(
        user_id=user_id,
        session_id=session_id,
        new_message=types.Content(
            parts=[types.Part(text="Generate fun activities for the topic 'Photosynthesis' for 5th grade students")]
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
    
    # Update state after generating activities
    updated_state = update_fun_activity_state(
        current_state=session.state,
        topic="photosynthesis",
        activity_type="quiz",
        completed=False
    )
    
    # Update session state
    session.state.update(updated_state)
    
    # Example 2: Generate activities for another topic (should remember preferences)
    print("\n🌍 Generating activities for 'World War II'...")
    
    response2_generator = runner.run(
        user_id=user_id,
        session_id=session_id,
        new_message=types.Content(
            parts=[types.Part(text="Create activities for 'World War II' - I prefer scenario-based activities")]
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
    
    # Update state again
    updated_state = update_fun_activity_state(
        current_state=session.state,
        topic="world_war_ii",
        activity_type="scenario",
        completed=True
    )
    
    session.state.update(updated_state)
    
    # Example 3: Ask for suggestions based on history
    print("\n💡 Asking for activity suggestions based on history...")
    
    response3_generator = runner.run(
        user_id=user_id,
        session_id=session_id,
        new_message=types.Content(
            parts=[types.Part(text="What types of activities would you suggest for me based on my history?")]
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
    
    # Display current session state
    print("\n📊 Current Session State:")
    print(f"User Preferences: {get_user_preferences(session.state)}")
    print(f"Recent Topics: {session.state.get('recent_topics', [])}")
    print(f"Activity History: {session.state.get('activity_history', {})}")
    print(f"Suggested Activity Types: {suggest_activity_types(session.state)}")
    
    return session


if __name__ == "__main__":
    # Run the example
    asyncio.run(run_fun_activity_with_state()) 