#!/usr/bin/env python3
"""
Interactive Educational Agent Chat Interface

This script provides an interactive chat interface for both fun activity and lesson planning agents
with persistent session state management.
"""

import asyncio
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types
from agents.fun_activity import fun_activity_agent
from agents.planning import lesson_planning_agent
from utils import (
    initialize_fun_activity_state,
    initialize_planning_state,
    update_fun_activity_state,
    update_planning_state,
    get_user_preferences,
    get_teacher_preferences,
    suggest_activity_types,
    suggest_teaching_improvements
)

# ===== PART 1: Initialize In-Memory Session Service =====
session_service = InMemorySessionService()

# ===== PART 2: Agent Selection and State Management =====
def select_agent():
    """Allow user to select which agent to chat with."""
    print("\n🎓 Educational Agent Chat Interface")
    print("=" * 50)
    print("Select an agent to chat with:")
    print("1. Fun Activity Agent (generates educational activities)")
    print("2. Lesson Planning Agent (creates weekly lesson plans)")
    
    while True:
        choice = input("\nChoose an agent (1-2): ").strip()
        if choice == "1":
            return "fun_activity", fun_activity_agent
        elif choice == "2":
            return "planning", lesson_planning_agent
        else:
            print("❌ Invalid choice. Please enter 1 or 2.")

def get_user_info(agent_type):
    """Collect user information for session initialization."""
    print(f"\n📝 Setting up your {agent_type.replace('_', ' ').title()} session...")
    
    if agent_type == "fun_activity":
        user_id = input("Enter your teacher ID (or press Enter for 'teacher_001'): ").strip() or "teacher_001"
        grade_level = input("Enter default grade level (or press Enter for '5th'): ").strip() or "5th"
        return user_id, {"grade_level": grade_level}
    else:  # planning
        teacher_id = input("Enter your teacher ID (or press Enter for 'teacher_001'): ").strip() or "teacher_001"
        teaching_style = input("Enter preferred teaching style (interactive/lecture/project-based, or press Enter for 'interactive'): ").strip() or "interactive"
        return teacher_id, {"teaching_style": teaching_style}

async def add_user_query_to_history(session_service, app_name, user_id, session_id, user_input):
    """Add user query to interaction history."""
    session = await session_service.get_session(
        app_name=app_name,
        user_id=user_id,
        session_id=session_id
    )
    
    if session:
        # Add to interaction history if it exists in state
        if "interaction_history" not in session.state:
            session.state["interaction_history"] = []
        
        session.state["interaction_history"].append({
            "type": "user_query",
            "content": user_input,
            "timestamp": asyncio.get_event_loop().time()
        })

async def call_agent_async(runner, user_id, session_id, user_input):
    """Process user input through the agent and display response."""
    try:
        # Create proper content format for ADK
        content = types.Content(
            parts=[types.Part(text=user_input)]
        )
        
        # Call the agent
        response_generator = runner.run(
            user_id=user_id,
            session_id=session_id,
            new_message=content
        )
        
        # Process the response
        print("\n🤖 Agent: ", end="", flush=True)
        final_response = None
        
        for event in response_generator:
            if hasattr(event, 'content'):
                final_response = event
                # Extract text from the response
                if hasattr(event.content, 'parts') and event.content.parts:
                    for part in event.content.parts:
                        if hasattr(part, 'text'):
                            print(part.text)
                            break
                else:
                    print(str(event.content))
                break
        
        if not final_response:
            print("No response received from agent.")
            
        return final_response
        
    except Exception as e:
        print(f"\n❌ Error calling agent: {e}")
        return None

def display_session_summary(session_state, agent_type):
    """Display a summary of the current session state."""
    print("\n" + "="*50)
    print("📊 SESSION SUMMARY")
    print("="*50)
    
    if agent_type == "fun_activity":
        preferences = get_user_preferences(session_state)
        print(f"🎯 User Preferences: {preferences}")
        print(f"📚 Recent Topics: {session_state.get('recent_topics', [])}")
        print(f"📈 Activity History: {session_state.get('activity_history', {})}")
        suggestions = suggest_activity_types(session_state)
        print(f"💡 Suggested Activity Types: {suggestions}")
    else:  # planning
        preferences = get_teacher_preferences(session_state)
        print(f"👨‍🏫 Teacher Preferences: {preferences}")
        print(f"📝 Recent Plans: {session_state.get('recent_plans', [])}")
        print(f"📊 Planning History: {session_state.get('planning_history', {})}")
        suggestions = suggest_teaching_improvements(session_state)
        print(f"🎯 Teaching Suggestions: {suggestions}")
    
    interaction_count = len(session_state.get('interaction_history', []))
    print(f"💬 Total Interactions: {interaction_count}")

async def main_async():
    """Main async function for the interactive chat."""
    
    # ===== PART 3: Agent and User Selection =====
    agent_type, selected_agent = select_agent()
    user_id, user_config = get_user_info(agent_type)
    
    # ===== PART 4: Session Setup =====
    APP_NAME = f"Educational_{agent_type.title()}_Agent"
    
    # Initialize appropriate state
    if agent_type == "fun_activity":
        initial_state = initialize_fun_activity_state(
            user_id=user_id,
            grade_level=user_config["grade_level"]
        )
    else:  # planning
        initial_state = initialize_planning_state(
            teacher_id=user_id,
            default_style=user_config["teaching_style"]
        )
    
    # Add interaction history to initial state
    initial_state["interaction_history"] = []
    
    # ===== PART 5: Session Creation =====
    new_session = await session_service.create_session(
        app_name=APP_NAME,
        user_id=user_id,
        session_id=f"{agent_type}_session_{user_id}"
    )
    
    # Set initial state
    new_session.state.update(initial_state)
    
    SESSION_ID = new_session.id
    print(f"\n✅ Created new session: {SESSION_ID}")
    
    # ===== PART 6: Agent Runner Setup =====
    runner = Runner(
        agent=selected_agent,
        app_name=APP_NAME,
        session_service=session_service,
    )
    
    # ===== PART 7: Interactive Conversation Loop =====
    print(f"\n🚀 Welcome to {agent_type.replace('_', ' ').title()} Agent Chat!")
    print("=" * 50)
    print("💡 Tips:")
    if agent_type == "fun_activity":
        print("   - Ask for activities on any topic (e.g., 'Create activities for photosynthesis')")
        print("   - Request specific activity types (e.g., 'I want quiz activities for fractions')")
        print("   - Ask for suggestions based on your history")
    else:
        print("   - Request lesson plans (e.g., 'Create a lesson plan for 5th grade fractions')")
        print("   - Ask for teaching suggestions based on your history")
        print("   - Request plans for different grade levels and subjects")
    
    print("\n📝 Commands:")
    print("   - Type 'summary' to see your session summary")
    print("   - Type 'exit' or 'quit' to end the conversation")
    print("\n" + "="*50)
    
    interaction_count = 0
    
    while True:
        # Get user input
        user_input = input(f"\n[{interaction_count + 1}] You: ").strip()
        
        # Check for special commands
        if user_input.lower() in ["exit", "quit"]:
            print("\n👋 Ending conversation. Goodbye!")
            break
        elif user_input.lower() == "summary":
            current_session = await session_service.get_session(
                app_name=APP_NAME, user_id=user_id, session_id=SESSION_ID
            )
            display_session_summary(current_session.state, agent_type)
            continue
        elif not user_input:
            print("❌ Please enter a message or type 'exit' to quit.")
            continue
        
        # Update interaction history
        await add_user_query_to_history(
            session_service, APP_NAME, user_id, SESSION_ID, user_input
        )
        
        # Process the user query through the agent
        response = await call_agent_async(runner, user_id, SESSION_ID, user_input)
        
        # Update session state based on the interaction
        if response:
            current_session = await session_service.get_session(
                app_name=APP_NAME, user_id=user_id, session_id=SESSION_ID
            )
            
            # Try to extract topic information for state updates
            # This is a simple heuristic - in production you'd want more sophisticated parsing
            lower_input = user_input.lower()
            
            if agent_type == "fun_activity":
                # Simple topic extraction for fun activities
                topic = "general"  # Default
                activity_type = "mixed"  # Default
                
                if "quiz" in lower_input:
                    activity_type = "quiz"
                elif "scenario" in lower_input:
                    activity_type = "scenario"
                elif "word game" in lower_input:
                    activity_type = "word_games"
                elif "fill" in lower_input and "blank" in lower_input:
                    activity_type = "fitb"
                
                # Extract topic (simple keyword matching)
                for word in ["photosynthesis", "fractions", "history", "science", "math", "english"]:
                    if word in lower_input:
                        topic = word
                        break
                
                updated_state = update_fun_activity_state(
                    current_state=current_session.state,
                    topic=topic,
                    activity_type=activity_type,
                    completed=False  # Assume not completed unless specified
                )
                current_session.state.update(updated_state)
                
            else:  # planning
                # Simple topic and grade extraction for planning
                topic = "general"
                grade_level = "5th"  # Default
                
                # Extract topic and grade
                for word in ["fractions", "photosynthesis", "history", "science", "math", "english"]:
                    if word in lower_input:
                        topic = word
                        break
                
                for grade in ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"]:
                    if grade in lower_input:
                        grade_level = grade
                        break
                
                updated_state = update_planning_state(
                    current_state=current_session.state,
                    topic=topic,
                    grade_level=grade_level,
                    planning_stage="content_planning"  # Assume we're in planning stage
                )
                current_session.state.update(updated_state)
            
        interaction_count += 1
    print(interaction_count)
    print(current_session.state)
    # ===== PART 8: Final State Examination =====
    final_session = await session_service.get_session(
        app_name=APP_NAME, user_id=user_id, session_id=SESSION_ID
    )
    import pdb; pdb.set_trace()
    print(f"\n🎉 Chat session completed with {interaction_count} interactions!")
    display_session_summary(current_session.state, agent_type)

def main():
    """Entry point for the application."""
    try:
        asyncio.run(main_async())
    except KeyboardInterrupt:
        print("\n\n👋 Chat interrupted. Goodbye!")
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")

if __name__ == "__main__":
    main() 