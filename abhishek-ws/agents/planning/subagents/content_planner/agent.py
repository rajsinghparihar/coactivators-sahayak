"""content_planner_agent."""

from google.adk import Agent
from . import prompt

MODEL = "gemini-2.5-flash"

content_planner_agent = Agent(
    model=MODEL,
    name="content_planner_agent",
    instruction=prompt.CONTENT_PLANNING_PROMPT,
    output_key="content_plan",
) 