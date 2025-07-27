"""scenario_generator_agent."""

from google.adk import Agent

# from google.adk.tools import google_search
from . import prompt

MODEL = "gemini-2.5-flash"

scenario_generator_agent = Agent(
    model=MODEL,
    name="scenario_generator_agent",
    instruction=prompt.SCENARIO_GENERATION_PROMPT,
    output_key="scenario_activities",
    # tools=[google_search],
)
