"""quiz_generator_agent."""

from google.adk import Agent

# from google.adk.tools import google_search
from . import prompt

MODEL = "gemini-2.5-flash"

quiz_generator_agent = Agent(
    model=MODEL,
    name="quiz_generator_agent",
    instruction=prompt.QUIZ_GENERATION_PROMPT,
    output_key="quiz_activities",
    # tools=[google_search],
)
