"""fitb_generator_agent."""

from google.adk import Agent

# from google.adk.tools import google_search
from . import prompt

MODEL = "gemini-2.5-flash"

fitb_generator_agent = Agent(
    model=MODEL,
    name="fitb_generator_agent",
    instruction=prompt.FITB_GENERATION_PROMPT,
    output_key="fitb_activities",
    # tools=[google_search],
)
