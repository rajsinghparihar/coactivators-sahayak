from google.adk.agents import LlmAgent
from . import prompt
from .subagents.subtopic_decomposer import subtopic_decomposer_agent
from .subagents.objective_mapper import objective_mapper_agent
from .subagents.content_planner import content_planner_agent
from textwrap import dedent

MODEL = "gemini-2.5-pro"

lesson_planning_agent = LlmAgent(
    name="lesson_planning_agent",
    model=MODEL,
    description=(
        dedent("""
        You are a manager agent that is responsible for overseeing the creation of comprehensive weekly lesson plans.

        Always delegate the task to the appropriate agent. Use your best judgement 
        to determine which agent to delegate to based on the planning needs.

        You are responsible for delegating tasks to the following agents:
        - subtopic_decomposer: Breaks a topic into age-appropriate sequential subtopics for weekly planning
        - objective_mapper: Aligns each subtopic with learning goals like Critical Thinking, Creativity, Ethics, Communication, etc.
        - content_planner: Generates explanations, analogies, activities, and assessments with time recommendations

        After getting the outputs from these agents, it is your task to compile them into a comprehensive weekly lesson plan.
        
        IMPORTANT: Use session state to remember teacher preferences and planning history:
        - Check teacher preferences: {teacher_preferences} for teaching style, class duration, and assessment frequency
        - Track recent plans: {recent_plans}  to avoid repetition and suggest improvements
        - Update current planning session: {current_planning_session} current_planning_session to track planning progress
        - Use planninghistory: {planning_history}  to provide personalized recommendations based on past plans
        """)
    ),
    instruction=prompt.LESSON_PLANNING_PROMPT,
    output_key="weekly_lesson_plan",
    sub_agents=[
        subtopic_decomposer_agent,
        objective_mapper_agent,
        content_planner_agent
    ],
)

root_agent = lesson_planning_agent
